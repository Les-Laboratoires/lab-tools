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

    new app.DynamicPaginator({
      channel: message.channel,
      fetchPageCount: async () => {
        const total = await getAvailableUsersTotal(minNoteCount)
        return Math.ceil(total / itemCountByPage)
      },
      fetchPage: async (pageIndex) => {
        const page = await getLadder(pageIndex, itemCountByPage, minNoteCount)

        if (page.length === 0)
          return `${app.emote(message, "DENY")} No ladder available.`

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
