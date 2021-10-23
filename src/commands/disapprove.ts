import * as app from "../app.js"

export default new app.Command({
  name: "disapprove",
  description: "Disapprove a member",
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
      description: "The presentation of disapproved member",
      castValue: "message",
    },
  ],
  async run(message) {
    const target: app.GuildMember = message.args.target

    await app.disapproveMember(target, message.args.presentation)

    return message.send(
      `${app.emote(message, "CHECK")} Successfully disapproved **${
        target.user.tag
      }**.`
    )
  },
})
