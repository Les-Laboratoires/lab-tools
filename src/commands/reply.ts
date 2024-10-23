import * as app from "#app"

export default new app.Command({
  name: "reply",
  description: "The reply command",
  channelType: "guild",
  middlewares: [app.staffOnly],
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
    const guild = await app.getGuild(message.guild)

    if (!guild) return

    await app.addReply({
      guild_id: guild._id,
      pattern: message.args.pattern?.source ?? null,
      channel: message.args.everywhere
        ? "all"
        : (message.args.channel?.id ?? null),
      message: message.args.message,
    })

    await message.channel.send(
      await app.getSystemMessage("success", "Successfully added the reply"),
    )
  },
  subs: [
    new app.Command({
      name: "list",
      description: "List all the replies",
      channelType: "guild",
      middlewares: [app.staffOnly],
      async run(message) {
        const guild = await app.getGuild(message.guild)

        if (!guild) return

        const replies = await app.replies.get(String(guild._id), guild._id)

        new app.StaticPaginator({
          target: message.channel,
          placeHolder: await app.getSystemMessage(
            "default",
            "No replies found",
          ),
          pages: await app.divider(replies, 10, async (page, index, all) => {
            return await app.getSystemMessage("default", {
              header: "Guild's reply list",
              body: page
                .map(
                  (reply) =>
                    `\`${app.forceTextSize(reply._id, String(Math.max(...page.map((r) => r._id))).length)}\` ${
                      reply.channel === "all" || !reply.channel
                        ? "all"
                        : app.channelMention(reply.channel)
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
    new app.Command({
      name: "remove",
      description: "Remove a reply",
      channelType: "guild",
      middlewares: [app.staffOnly],
      options: [
        {
          name: "id",
          description: "The id of the reply to remove",
          required: true,
          type: "number",
        },
      ],
      async run(message) {
        const guild = await app.getGuild(message.guild)

        if (!guild) return

        const replies = await app.replies.get(String(guild._id), guild._id)

        const reply = replies.find((r) => r._id === message.args.id)

        if (!reply) {
          await message.channel.send(
            await app.getSystemMessage("error", "No reply found with that id"),
          )
          return
        }

        await app.removeReply(reply._id)

        await message.channel.send(
          await app.getSystemMessage(
            "success",
            "Successfully removed the reply",
          ),
        )
      },
    }),
  ],
})
