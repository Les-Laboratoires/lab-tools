import * as app from "#app"

import userTable from "#tables/user.ts"

export default new app.Command({
  name: "leaderboard",
  aliases: ["lb", "ladder", "top", "rank"],
  description: "Show all leaderboards",
  channelType: "guild",
  options: [
    app.option({
      name: "lines",
      description: "Number of lines to show per page",
      type: "number",
      default: 15,
      aliases: ["line", "count"],
      validate: (value) => value > 0 && value <= 50,
    }),
  ],
  async run(message) {
    const guild = await app.getGuild(message.guild, { forceExists: true })

    const ladders = [
      app.ratingLadder(guild._id),
      app.pointLadder,
      app.activeLadder(guild._id),
      new app.Ladder<{ rank: number; coins: number }>({
        title: "Coins",
        fetchLineCount() {
          return userTable.count()
        },
        async fetchLines(options) {
          return userTable.query
            .select(
              "coins",
              app.database.raw('rank() over (order by coins desc) as "rank"'),
            )
            .limit(options.pageLineCount)
            .offset(options.pageIndex * options.pageLineCount)
            .then(
              (rows) =>
                rows as unknown as {
                  rank: number
                  coins: number
                }[],
            )
        },
        formatLine(line) {
          return `${app.formatRank(line.rank)} ${line.coins} coins`
        },
      }),
    ]

    return message.channel.send({
      embeds: [
        new app.EmbedBuilder().setTitle("Leaderboards").setFields(
          await Promise.all(
            ladders.map(async (ladder) => ({
              name: ladder.options.title,
              value:
                (await ladder.fetchPage({
                  pageIndex: 0,
                  pageLineCount: 15,
                })) || `${app.emote(message, "Cross")} No ladder available`,
              inline: false,
            })),
          ),
        ),
      ],
    })
  },
})
