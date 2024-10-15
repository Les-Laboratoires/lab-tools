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
      new app.Ladder<{ rank: number; coins: number; user_id: string }>({
        title: "Coins",
        fetchLineCount() {
          return userTable.count('"coins" > 0')
        },
        async fetchLines(options) {
          return userTable.query
            .select(
              "coins",
              app.database.raw('rank() over (order by coins desc) as "rank"'),
              "id as user_id",
            )
            .where("coins", ">", 0)
            .limit(options.pageLineCount)
            .offset(options.pageIndex * options.pageLineCount)
            .then(
              (rows) =>
                rows as unknown as {
                  rank: number
                  coins: number
                  user_id: string
                }[],
            )
        },
        formatLine(line, _, lines) {
          return `${app.formatRank(line.rank)} \`${app.forceTextSize(
            line.coins,
            Math.max(...lines.map((l) => String(l.coins).length)),
            true,
          )}\` coins - ${app.userMention(line.user_id)}`
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
