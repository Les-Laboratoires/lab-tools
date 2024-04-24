import { execSync } from "child_process"

import * as app from "../app.js"

import restart from "../tables/restart.js"

type State = "waiting" | "running" | "done"
type Command = { cmd: string; state: State; time: number }

export default new app.Command({
  name: "deploy",
  description: "Deploy Lab Tool",
  channelType: "all",
  botOwnerOnly: true,
  cooldown: {
    duration: 10000,
    type: app.CooldownType.Global,
  },
  async run(message) {
    message.triggerCoolDown()

    const commands: Command[] = [
      { state: "waiting", time: 0, cmd: "git reset --hard" },
      { state: "waiting", time: 0, cmd: "git pull" },
      { state: "waiting", time: 0, cmd: "npm install" },
      { state: "waiting", time: 0, cmd: "npm run build" },
      { state: "waiting", time: 0, cmd: "pm2 restart tool" },
    ]

    const format = (command: Command) =>
      `${app.emote(
        message,
        (
          {
            waiting: "MINUS",
            running: "WAIT",
            done: "CHECK",
          } as const
        )[command.state],
      )} ${command.state === "running" ? "**" : ""}\`>_ ${command.cmd}\`${
        command.state === "running" ? "**" : ""
      } ${command.time ? `(**${command.time}** ms)` : ""}`.trim()

    const makeView = (finish?: boolean) =>
      `${commands
        .map((command) =>
          format({ ...command, state: finish ? "done" : command.state }),
        )
        .join("\n")}\n${app.emote(message, finish ? "CHECK" : "WAIT")} ${
        finish ? `**Deployed** 🚀` : "Deploying..."
      }`

    const run = async (command: Command) => {
      command.state = "running"

      await view.edit(makeView())

      execSync(command.cmd, { cwd: process.cwd() })

      command.state = "done"
    }

    const view = await message.channel.send(makeView())

    const created_at = new Date().toISOString()

    await restart.query.insert({
      content: makeView(true),
      last_channel_id: message.channel.id,
      last_message_id: view.id,
      created_at,
    })

    try {
      for (const command of commands) {
        let time = Date.now()

        await run(command)

        command.time = Date.now() - time
      }
    } catch (error: any) {
      await restart.query.delete().where({ created_at })

      app.error(error)

      return view.edit({
        embeds: [
          new app.EmbedBuilder()
            .setTitle("\\❌ An error has occurred.")
            .setColor("Red")
            .setDescription(
              await app.code.stringify({
                content: (error?.stack ?? error?.message ?? String(error))
                  .split("")
                  .reverse()
                  .slice(0, 2000)
                  .reverse()
                  .join(""),
              }),
            ),
        ],
      })
    }
  },
})
