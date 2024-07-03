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
    const result = await app.globalBan(message.args.target, message.args.reason)

    const fails = result.filter((r) => r.status === "rejected")

    await app.sendLog(
      message.guild,
      `**${message.args.target.tag}** has been banned by **${message.author.tag}** from **${result.length - fails.length}** labs.\nReason: ${message.args.reason}`,
    )
  },
})
