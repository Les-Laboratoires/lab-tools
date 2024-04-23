import { execSync } from "child_process"

import * as app from "../app.js"

import restart from "../tables/restart.js"

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

    const waiting = await message.channel.send(
      `${app.emote(message, "WAIT")} Deploying...`,
    )

    const commands: string[] = []

    async function run(command: string, args: string[] = []) {
      await waiting.edit(
        `${app.emote(message, "WAIT")} Deploying...\n${app.emote(message, "WAIT")} \`>_ ${command} ${args.join(" ")}\`${commands
          .toReversed()
          .join("")}`,
      )

      let timer = Date.now()

      execSync(`${command} ${args.join(" ")}`, {
        cwd: process.cwd(),
      })

      commands.push(
        `\n${app.emote(message, "CHECK")} \`>_ ${command} ${args.join(" ")}\` (${
          Date.now() - timer
        }ms)`,
      )
    }

    await restart.query.insert({
      content: `${app.emote(message, "CHECK")} Successfully deployed.`,
      last_channel_id: message.channel.id,
      last_message_id: waiting.id,
      created_at: new Date().toISOString(),
    })

    try {
      await run("git", ["reset", "--hard"])
      await run("git", ["pull"])
      await run("npm", ["install"])
      await run("npm", ["run", "build"])
      await run("pm2", ["restart", "tool"])
    } catch (error: any) {
      await restart.query.delete().where({ last_message_id: waiting.id })

      app.error(error)

      return waiting.edit({
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
