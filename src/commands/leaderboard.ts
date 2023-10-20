import * as app from "../app.js"

export default new app.Command({
  name: "leaderboard",
  aliases: ["lb", "ladder", "top", "rank"],
  description: "The leaderboard command",
  channelType: "guild",
  async run(message) {
    const guild = await app.getGuild(message.guild, true)

    const ladders = [
      [app.noteLadder, "Notes"] as const,
      [app.pointLadder, "Points"] as const,
      [app.activeLadder(guild._id), "Active"] as const,
    ]

    const fetched = await Promise.all(
      ladders.map(
        async ([ladder, name]) =>
          [
            ladder,
            await ladder.fetchPage({
              page: 0,
              itemCountByPage: 15,
              minScore: 0,
            }),
            name,
          ] as const
      )
    )

    return message.send({
      embeds: [
        new app.MessageEmbed().setTitle("Leaderboards").setFields(
          fetched.map(([ladder, page, name]) => ({
            name,
            // @ts-ignore
            value: page.map(ladder.formatLine).join("\n"),
            inline: true,
          }))
        ),
      ],
    })
  },
})
