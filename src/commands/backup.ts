import * as app from "../app.js"

import restart from "../tables/restart.js"

export default new app.Command({
  name: "backup",
  description: "Manage database backups",
  channelType: "all",
  botOwnerOnly: true,
  async run(message) {
    return app.sendCommandDetails(message, this)
  },
  subs: [
    new app.Command({
      name: "create",
      description: "Create a database backup",
      aliases: ["new", "add", "save"],
      channelType: "all",
      botOwnerOnly: true,
      async run(message) {
        await app.createBackup()

        return message.reply(
          `${app.emote(message, "CheckMark")} Successfully created backup.`,
        )
      },
    }),
    new app.Command({
      name: "restore",
      description: "Restore a database backup",
      aliases: ["load"],
      channelType: "all",
      botOwnerOnly: true,
      async run(message) {
        await app.restoreBackup(() =>
          message.channel.send(
            `${app.emote(message, "CheckMark")} Successfully restored backup.`,
          ),
        )
      },
    }),
  ],
})
