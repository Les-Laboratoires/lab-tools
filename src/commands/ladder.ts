import * as app from "../app.js"

import {
  getLadder,
  graphicalNote,
  getAvailableUsersTotal,
} from "../tables/note.js"

export default new app.Command({
  name: "ladder",
  aliases: ["top", "lb", "leaderboard"],
  description: "The leaderboard",
  channelType: "all",
  async run(message) {
    const itemCountByPage = 15
    const minNoteCount = 5
    const total = await getAvailableUsersTotal(minNoteCount)

    new app.Paginator({
      channel: message.channel,
      placeHolder: "No ladder available.",
      pageCount: Math.ceil(total / itemCountByPage),
      pages: async (pageIndex) => {
        const page = await getLadder(pageIndex, itemCountByPage, minNoteCount)

        return new app.MessageEmbed().setTitle(`Leaderboard`).setDescription(
          page
            .map((line) => {
              return `\`[ ${app.forceTextSize(
                line.rank,
                3,
                true
              )} ]\` ${graphicalNote(line.score)}  **${line.score.toFixed(
                2
              )}**  <@${line.user_id}>`
            })
            .join("\n")
        )
      },
    })
  },
})
