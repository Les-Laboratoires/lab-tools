import * as app from "../app.js"

export default new app.Command({
  name: "approve",
  description: "Approve a member",
  middlewares: [app.staffOnly()],
  channelType: "guild",
  rest: {
    name: "presentation",
    description: "The presentation of approved member",
  },
  positional: [
    {
      name: "target",
      description: "Target member",
      castValue: "member",
    },
  ],
  async run(message) {
    const target: app.GuildMember | null = message.args.target

    if (!target)
      return new Error(
        "'!approve' command is not implemented without arguments"
      )

    await app.approveMember(target, message.args.presentation || undefined)

    return message.send(
      `${app.emote(message, "CHECK")} Successfully approved **${
        target.user.tag
      }**.`
    )
  },
})
