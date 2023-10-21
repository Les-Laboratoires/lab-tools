import * as app from "../app.js"

export default new app.Command({
  name: "leaderboard",
  aliases: ["lb", "ladder", "top", "rank"],
  description: "The leaderboard command",
  channelType: "guild",
  async run(message) {
    const guild = await app.getGuild(message.guild, true)

    const ladders = [
      app.noteLadder,
      app.pointLadder,
      app.activeLadder(guild._id),
    ]

    return message.send({
      embeds: [
        new app.MessageEmbed().setTitle("Leaderboards").setFields(
          ladders.map((ladder) => ({
            name: ladder.options.title,
            // @ts-ignore
            value: page.map(ladder.formatLine).join("\n"),
            inline: false,
          }))
        ),
      ],
    })
  },
})
