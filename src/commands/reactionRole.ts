import * as app from "../app.js"

import rero, { getReactionRoleMessageOptions } from "../tables/rero.js"

export default new app.Command({
  name: "reactionRole",
  aliases: ["rero", "rr"],
  description: "The reactionRole command",
  channelType: "guild",
  async run(message) {
    // todo: code here
    return message.send("reactionRole command is not yet implemented.")
  },
  subs: [
    new app.Command({
      name: "send",
      description: "Send reaction-role message",
      channelType: "guild",
      middlewares: [app.staffOnly()],
      positional: [
        {
          name: "channel",
          description: "Channel of reaction-role message",
          default: (message) => message?.channel.id as string,
          castValue: "channel+",
        },
      ],
      async run(message) {
        await message.args.channel.send(
          await getReactionRoleMessageOptions(message.guild)
        )

        return message.send(
          `${app.emote(
            message,
            "CHECK"
          )} Successfully sent reaction-role message.`
        )
      },
    }),
    new app.Command({
      name: "add",
      description: "Add reaction-role",
      channelType: "guild",
      middlewares: [app.staffOnly()],
      positional: [
        {
          name: "role",
          description: "Role to add",
          castValue: "role+",
          required: true,
        },
      ],
      async run(message) {
        if (message.args.role.guild.id !== message.guild.id)
          return message.send(
            `${app.emote(
              message,
              "DENY"
            )} The given role is not in your current guild.`
          )

        await rero.query.insert({
          role_id: message.args.role.id,
          guild_id: message.guild.id,
        })

        return message.send(
          `${app.emote(message, "CHECK")} Successfully add reaction-role.`
        )
      },
    }),
    new app.Command({
      name: "delete",
      aliases: ["remove", "rm"],
      description: "Delete reaction-role",
      channelType: "guild",
      middlewares: [app.staffOnly()],
      positional: [
        {
          name: "role",
          description: "Role to add",
          castValue: "role+",
          required: true,
        },
      ],
      async run(message) {
        await rero.query.delete().where({ role_id: message.args.role.id })

        return message.send(
          `${app.emote(message, "CHECK")} Successfully delete reaction-role.`
        )
      },
    }),
  ],
})
