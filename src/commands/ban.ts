import * as app from "#app"

export default new app.Command({
  name: "ban",
  description: "Ban a user from all labs",
  channelType: "guild",
  middlewares: [app.staffOnly(), app.labOnly()],
  positional: [
    {
      name: "target",
      description: "The target user to ban",
      type: "user",
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: "string",
      required: true,
    },
  ],
  async run(message) {
    const result = await app.globalBan(
      message.author,
      message.args.target,
      message.args.reason,
    )

    const fails = result.filter((r) => r.status === "rejected")

    if (fails.length === result.length) {
      return message.reply(
        `${app.emote(message, "Cross")} Failed to ban the user from all labs.`,
      )
    }

    return message.reply(
      `${app.emote(message, "CheckMark")} Banned the user from **${
        result.length - fails.length
      }** labs.`,
    )
  },
})
