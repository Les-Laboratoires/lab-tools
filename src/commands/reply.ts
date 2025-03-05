import { channelMention } from "discord.js"

import { Command } from "#core/index"
import { StaticPaginator } from "#core/pagination"
import { divider, forceTextSize, getSystemMessage } from "#core/util"

import { staffOnly } from "#namespaces/middlewares"
import { addReply, removeReply, replies } from "#namespaces/reply"
import { getGuild } from "#namespaces/tools"

export default new Command({
  name: "reply",
  description: "The reply command",
  channelType: "guild",
  middlewares: [staffOnly],
  options: [
    {
      name: "pattern",
      description: "The pattern to match",
      required: false,
      type: "regex",
    },
    {
      name: "channel",
      description: "The channel to reply in and to watch for messages in",
      required: false,
      type: "channel",
    },
  ],
  flags: [
    {
      name: "everywhere",
      description: "Watch and reply in every channel",
      flag: "e",
      aliases: ["all"],
    },
  ],
  rest: {
    name: "message",
    description: "The message to reply with",
    required: true,
  },
  async run(message) {
    const guild = await getGuild(message.guild)

    if (!guild) return

    await addReply({
      guild_id: guild._id,
      pattern: message.args.pattern?.source ?? null,
      channel: message.args.everywhere
        ? "all"
        : (message.args.channel?.id ?? null),
      message: message.args.message,
    })

    await message.channel.send(
      await getSystemMessage("success", "Successfully added the reply"),
    )
  },
  subs: [
    new Command({
      name: "list",
      description: "List all the replies",
      channelType: "guild",
      middlewares: [staffOnly],
      async run(message) {
        const guild = await getGuild(message.guild)

        if (!guild) return

        const _replies = await replies.get(String(guild._id), guild._id)

        new StaticPaginator({
          target: message.channel,
          placeHolder: await getSystemMessage("default", "No replies found"),
          pages: await divider(_replies, 10, async (page, index, all) => {
            return await getSystemMessage("default", {
              header: "Guild's reply list",
              body: page
                .map(
                  (reply) =>
                    `\`${forceTextSize(reply._id, String(Math.max(...page.map((r) => r._id))).length)}\` ${
                      reply.channel === "all" || !reply.channel
                        ? "all"
                        : channelMention(reply.channel)
                    } - ${
                      reply.pattern ?? "No pattern"
                    } - ${reply.message.replace(/\n/g, " ").slice(0, 20)}`,
                )
                .join("\n"),
              footer: `Page ${index + 1} of ${all.length}`,
            })
          }),
        })
      },
    }),
    new Command({
      name: "remove",
      description: "Remove a reply",
      channelType: "guild",
      middlewares: [staffOnly],
      options: [
        {
          name: "id",
          description: "The id of the reply to remove",
          required: true,
          type: "number",
        },
      ],
      async run(message) {
        const guild = await getGuild(message.guild)

        if (!guild) return

        const _replies = await replies.get(String(guild._id), guild._id)

        const reply = _replies.find((r) => r._id === message.args.id)

        if (!reply) {
          await message.channel.send(
            await getSystemMessage("error", "No reply found with that id"),
          )
          return
        }

        await removeReply(reply._id)

        await message.channel.send(
          await getSystemMessage("success", "Successfully removed the reply"),
        )
      },
    }),
  ],
})
