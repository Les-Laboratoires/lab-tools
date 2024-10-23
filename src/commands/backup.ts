import fs from "fs"

import * as app from "#app"
import restart from "#tables/restart.ts"

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
      positional: [
        {
          name: "name",
          description: "The name of the backup",
          required: true,
          type: "string",
        },
      ],
      async run(message) {
        try {
          const backups = await fs.promises.readdir(
            app.database.config.backups!.location!,
          )

          if (backups.includes(message.args.name)) {
            return message.reply(
              `${app.emote(message, "Cross")} Backup with that name already exists.`,
            )
          }
        } catch {}

        await app.database.createBackup(message.args.name)

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
      positional: [
        {
          name: "name",
          description: "The name of the backup",
          required: true,
          type: "string",
        },
      ],
      async run(message) {
        const view = await message.reply(
          `${app.emote(message, "Loading")} Restoring backup...`,
        )

        await app.database.restoreBackup(message.args.name)

        const created_at = new Date().toISOString()

        await restart.query.insert({
          content: `${app.emote(message, "CheckMark")} Successfully restored the "${message.args.name}" backup and restarted the bot.`,
          last_channel_id: message.channel.id,
          last_message_id: view.id,
          created_at,
        })

        process.exit(0)
      },
    }),
    new app.Command({
      name: "list",
      description: "List all database backups",
      aliases: ["ls"],
      channelType: "all",
      botOwnerOnly: true,
      async run(message) {
        try {
          const backups = await fs.promises.readdir(
            app.database.config.backups!.location!,
          )

          return message.reply(
            backups.length
              ? backups.join("\n")
              : `${app.emote(message, "Cross")} No backups found.`,
          )
        } catch {
          return message.reply(
            `${app.emote(message, "Cross")} No backups found.`,
          )
        }
      },
    }),
  ],
})
