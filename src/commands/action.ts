import * as app from "../app.js"
import cp from "child_process"
import fs from "fs/promises"
import path from "path"

import todo, { ToDo } from "../tables/todo"

const home = path.join(process.cwd(), "..")

const allActions = {
  bts: async () => {
    // get to-do tasks
    //@ts-ignore
    const todoList: ToDo[] = await todo.query.whereLike("content", "%bot.ts%")

    // git pull
    await new Promise<void>((res, rej) =>
      cp.exec(
        "git reset --hard; git pull origin master",
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
      path.join(home, "bot.ts-docs", "in-comming-features.md"),
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

    for (const task of tasks) {
      if (!task.startsWith("* [x] "))
        if (!todoList.some((t) => task.includes(t.content))) {
          tasks[tasks.indexOf(task)] = task.replace("[ ]", "[x]")
        }
    }

    // write file
    await fs.writeFile(
      path.join(home, "bot.ts-docs", "in-comming-features.md"),
      base + tasks.join("\n"),
      "utf-8"
    )

    // git push
    await new Promise((res, rej) =>
      cp.exec(
        "git add *; git commit -m 'update todo list'; git push origin master; git pull origin master; git push origin master",
        {
          cwd: path.join(home, "bot.ts-docs"),
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
