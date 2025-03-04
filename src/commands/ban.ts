import { Command } from "#core/command"
import * as middlewares from "#namespaces/middlewares"
import { globalBan } from "#namespaces/automod"
import { emote } from "#namespaces/emotes"

export default new Command({
  name: "ban",
  description: "Ban a user from all labs",
  channelType: "guild",
  middlewares: [middlewares.staffOnly, middlewares.labOnly],
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
    const result = await globalBan(
      message.author,
      message.args.target,
      message.args.reason,
    )

    const fails = result.filter((r) => r.status === "rejected")

    if (fails.length === result.length) {
      return message.reply(
        `${emote(message, "Cross")} Failed to ban the user from all labs.`,
      )
    }

    return message.reply(
      `${emote(message, "CheckMark")} Banned the user from **${
        result.length - fails.length
      }** labs.`,
    )
  },
})
