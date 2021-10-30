import cp from "child_process"

import * as app from "../app.js"
import * as core from "../app/core"

import restart from "../tables/restart"

export default new app.Command({
  name: "deploy",
  description: "Deploy Lab Tool",
  channelType: "all",
  botOwnerOnly: true,
  coolDown: 5000,
  async run(message) {
    message.triggerCoolDown()

    const toEdit = await message.send(
      `${app.emote(message, "WAIT")} Deploying...`
    )

    await restart.query.insert({
      content: `${app.emote(message, "CHECK")} Deployed.`,
      last_channel_id: message.channel.id,
      last_message_id: message.id,
    })

    cp.exec(
      "git pull && npm i && yarn build && pm2 restart tool",
      { cwd: process.cwd() },
      (err, stdout, stderr) => {
        if (err) {
          Promise.all([
            restart.query.delete().where({ last_message_id: message.id }),
            toEdit.edit({
              embeds: [
                new core.SafeMessageEmbed()
                  .setTitle("\\❌ An error has occurred.")
                  .setColor("RED")
                  .setDescription(
                    app.code.stringify({
                      content: (err.stack ?? err.message)
                        .split("")
                        .reverse()
                        .slice(0, 2000)
                        .reverse()
                        .join(""),
                    })
                  ),
              ],
            }),
          ]).catch()
        }
      }
    )
  },
})
