import * as app from "../app.js"

import guilds from "../tables/guilds.js"

export default new app.Command({
  name: "topics",
  description: "The topics command",
  channelType: "guild",
  aliases: ["topic"],
  middlewares: [app.hasConfigKey("help_room_topic")],
  async run(message) {
    const config = await app.getConfig(message.guild, true)

    return message.send({
      embeds: [
        new app.SafeMessageEmbed()
          .setColor()
          .setTitle("Help rooms topic")
          .setDescription(config.help_room_topic as string),
      ],
    })
  },
  subs: [
    new app.Command({
      name: "set",
      aliases: ["add", "define", "="],
      description: "Define new topic",
      middlewares: [app.staffOnly()],
      channelType: "guild",
      rest: {
        name: "topic",
        description: "The new topic",
        required: true,
        all: true,
      },
      async run(message) {
        const config = await app.getConfig(message.guild, true)

        config.help_room_topic = message.args.topic || null

        await guilds.query.update(config).where({ id: message.guild.id })

        return message.send(
          `${app.emote(
            message,
            "CHECK"
          )} Successfully saved new help-room topic.`
        )
      },
    }),
    new app.Command({
      name: "refresh",
      aliases: ["apply", "reload"],
      description: "Apply new topic",
      channelType: "guild",
      middlewares: [
        app.staffOnly(),
        app.hasConfigKey("help_room_topic"),
        app.hasConfigKey("help_room_pattern"),
      ],
      async run(message) {
        const config = await app.getConfig(message.guild, true)

        await Promise.all(
          message.guild.channels.cache
            .filter((channel): channel is app.BaseGuildTextChannel => {
              return (
                channel.isText() &&
                channel.name.includes(config.help_room_pattern as string)
              )
            })
            .map((channel) => channel.setTopic(config.help_room_topic))
        )

        return message.send(
          `${app.emote(
            message,
            "CHECK"
          )} Successfully saved new help-room topic.`
        )
      },
    }),
  ],
})
