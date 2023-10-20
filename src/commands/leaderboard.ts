import * as app from "../app.js"

export default new app.Command({
  name: "leaderboard",
  aliases: ["lb", "ladder", "top", "rank"],
  description: "The leaderboard command",
  channelType: "guild",
  async run(message) {
    const noteLadder = await app.getNoteLadder({
      page: 0,
      itemCountByPage: 15,
      minNoteCount: 0,
    })

    const pointLadder = await app.getPointLadder({
      page: 0,
      itemCountByPage: 15,
    })

    return message.send({
      embeds: [
        new app.MessageEmbed().setTitle("Leaderboards").setFields([
          {
            name: "Notes sur 5",
            value: noteLadder.map(app.formatNoteLadderLine).join("\n"),
          },
          {
            name: "Help points",
            value: pointLadder.map(app.formatPointLadderLine).join("\n"),
          },
        ]),
      ],
    })
  },
})
