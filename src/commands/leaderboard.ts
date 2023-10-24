import * as app from "../app.js"

export default new app.Command({
  name: "leaderboard",
  aliases: ["lb", "ladder", "top", "rank"],
  description: "The leaderboard command",
  channelType: "guild",
  options: [
    {
      name: "lines",
      description: "Number of lines to show per page",
      type: "number",
      default: String(15),
      aliases: ["line", "count"],
      validate: (value: number) => value > 0 && value <= 50,
    },
  ],
  async run(message) {
    const guild = await app.getGuild(message.guild, true)

    const ladders = [
      app.noteLadder,
      app.pointLadder,
      app.activeLadder(guild._id),
    ]

    return message.channel.send({
      embeds: [
        new app.MessageEmbed().setTitle("Leaderboards").setFields(
          await Promise.all(
            ladders.map(async (ladder) => ({
              name: ladder.options.title,
              value:
                (await ladder.fetchPage({
                  pageIndex: 0,
                  pageLineCount: 15,
                })) || `${app.emote(message, "DENY")} No ladder available`,
              inline: false,
            }))
          )
        ),
      ],
    })
  },
})
