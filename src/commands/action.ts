import * as app from "../app.js"
import cp from "child_process"
import fs from "fs/promises"
import path from "path"

import todo from "../tables/todo.js"

const home = path.join(process.cwd(), "..")

const allActions = {
  bts: async () => {
    // get to-do tasks
    const todoList = await todo.query.whereLike("content", "%bot.ts:%")

    // git pull
    await new Promise<void>((res, rej) =>
      cp.exec(
        "git reset --hard && git pull origin master",
        {
          cwd: path.join(home, "bot.ts-docs"),
        },
        (err, stdout) => {
          if (!err) res()
          else rej(err)
        }
      )
    )

    // load file
    let file = await fs.readFile(
      path.join(home, "bot.ts-docs", "in-coming-features.md"),
      "utf-8"
    )

    // edit file
    const startText = "# In Coming Features\n"
    const startIndex = file.indexOf(startText) + startText.length
    const base = file.slice(0, startIndex)
    const tasks = file.slice(startIndex).split("\n")

    for (const todoTask of todoList) {
      if (!tasks.some((t) => t.includes(todoTask.content))) {
        tasks.push(`* [ ] ${todoTask.content}`)
      }
    }

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]

      if (!task.startsWith("* [x] ") && task.includes("["))
        if (!todoList.some((t) => task.includes(t.content))) {
          tasks[i] = task.replace("[ ]", "[x]")
        }
    }

    // write file
    await fs.writeFile(
      path.join(home, "bot.ts-docs", "in-coming-features.md"),
      base.trim() + tasks.join("\n").trim().replace(/\n\n/g, "\n"),
      "utf-8"
    )

    // git push
    await new Promise<void>((res, rej) =>
      cp.exec(
        "git add * && git commit -m 'update todo list' && git push origin master && git pull origin master && git push origin master",
        {
          cwd: path.join(home, "bot.ts-docs"),
        },
        (err) => {
          if (!err) res()
          else rej(err)
        }
      )
    )
  },
}

export default new app.Command({
  name: "action",
  aliases: ["do"],
  description: "Update Ghom stuff",
  channelType: "all",
  botOwnerOnly: true,
  positional: [
    {
      name: "actions",
      description: "Names of update actions (all by default)",
      default: Object.keys(allActions).join(","),
      castValue: "array",
    },
  ],
  async run(message) {
    const actions: (keyof typeof allActions)[] = message.args.actions

    for (const action of actions)
      if (action in allActions) await allActions[action]?.()

    return message.send(
      `${app.emote(
        message,
        "CHECK"
      )} Actions successfully done:\n${actions.join(", ")}`
    )
  },
  subs: [
    new app.Command({
      name: "list",
      channelType: "all",
      description: "List of names of update actions",
      async run(message) {},
    }),
  ],
})
