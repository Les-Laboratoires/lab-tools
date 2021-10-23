import * as app from "../app.js"

export default new app.Command({
  name: "approve",
  description: "Approve a member",
  middlewares: [app.staffOnly()],
  channelType: "guild",
  positional: [
    {
      name: "target",
      description: "Target member",
      castValue: "member",
      required: true,
    },
    {
      name: "presentation",
      description: "The presentation of approved member",
      castValue: "message",
    },
  ],
  async run(message) {
    const target: app.GuildMember = message.args.target

    await app.approveMember(target, message.args.presentation)

    return message.send(
      `${app.emote(message, "CHECK")} Successfully approved **${
        target.user.tag
      }**.`
    )
  },
})
