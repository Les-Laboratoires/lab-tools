import * as app from "../app"

import { getLadder, graphicalNote } from "../tables/note"

module.exports = new app.Command({
  name: "ladder",
  aliases: ["top", "lb", "leaderboard"],
  description: "The leaderboard",
  channelType: "all",
  async run(message) {
    const ladder = await getLadder()

    new app.Paginator({
      channel: message.channel,
      placeHolder: "No ladder available.",
      customEmojis: {
        start: app.Emotes.LEFT,
        previous: app.Emotes.MINUS,
        next: app.Emotes.PLUS,
        end: app.Emotes.RIGHT,
      },
      pages: app.Paginator.divider(ladder, 15).map((page) => {
        return new app.MessageEmbed().setTitle(`Leaderboard`).setDescription(
          page
            .map((line) => {
              return `\`[${app
                .forceTextSize(line.rank, 5, true)
                .replace(/\s/g, "·")}]\` ${graphicalNote(
                line.score
              )}  **${line.score.toFixed(2)}**  <@${line.user_id}>`
            })
            .join("\n")
        )
      }),
    })
  },
})
