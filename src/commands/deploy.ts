import cp from "child_process"

import * as app from "../app.js"
import * as core from "../app/core.js"

import restart from "../tables/restart.js"

export default new app.Command({
  name: "deploy",
  description: "Deploy Lab Tool",
  channelType: "all",
  botOwnerOnly: true,
  coolDown: 5000,
  async run(message) {
    message.triggerCoolDown()

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Deploying...`
    )

    const logs = await message.send(`\`>_\``)

    const commands: string[] = []

    async function run(command?: string) {
      return new Promise(async (resolve, reject) => {
        await logs.edit(
          `${app.emote(message, "WAIT")} Deploying...${commands.join("")}${
            command ? `\n\`>_ ${command}\`` : ""
          }`
        )

        if (command) {
          let timer = Date.now()

          cp.exec(command, { cwd: process.cwd() }, (err, stdout, stderr) => {
            if (err) return reject()

            commands.push(`\n\`>_ ${command}\` (${Date.now() - timer}ms)`)
            resolve(void 0)
          })
        } else resolve(void 0)
      })
    }

    await restart.query.insert({
      content: `${app.emote(message, "CHECK")} Successfully deployed.`,
      last_channel_id: message.channel.id,
      last_message_id: waiting.id,
      created_timestamp: Date.now(),
    })

    try {
      await run("git reset --hard")
      await run("git pull")
      await run("npm i")
      await run("yarn build")
      await run("pm2 restart tool")
      await run()
    } catch (error: any) {
      await restart.query.delete().where({ last_message_id: waiting.id })

      return waiting.edit({
        embeds: [
          new core.SafeMessageEmbed()
            .setTitle("\\❌ An error has occurred.")
            .setColor("RED")
            .setDescription(
              app.code.stringify({
                content: (error?.stack ?? error.message)
                  .split("")
                  .reverse()
                  .slice(0, 2000)
                  .reverse()
                  .join(""),
              })
            ),
        ],
      })
    }
  },
})
