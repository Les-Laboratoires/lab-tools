import * as app from "../app.js"

import note from "../tables/note.js"

export default new app.Command({
  name: "note",
  description: "Note management",
  channelType: "all",
  positional: [
    {
      name: "user",
      description: "The noted user",
      castValue: "user",
      checkCastedValue: (value, message) => {
        return (
          (value !== message?.author && value !== undefined) ||
          "You can't target yourself."
        )
      },
    },
    {
      name: "note",
      description: "Note from 0 to 5",
      castValue: "number",
      checkValue: /^[012345]$/,
    },
  ],
  async run(message) {
    if (message.args.user) {
      if (typeof message.args.note === "number") {
        const value = message.args.note as 0 | 1 | 2 | 3 | 4 | 5

        const fromUser = await app.getUser(message.author, true)
        const toUser = await app.getUser(message.args.user, true)

        const pack = {
          from_id: fromUser._id,
          to_id: toUser._id,
        }

        if (await note.query.where(pack).first()) {
          await note.query.update({ value }).where(pack)
        } else {
          await note.query.insert({ value, ...pack })
        }

        return message.send(
          `${app.emote(message, "CHECK")} Successfully noted.`
        )
      }

      return message.send({ embeds: [await app.noteEmbed(message.args.user)] })
    }

    return message.send({ embeds: [await app.noteEmbed(message.author)] })
  },
  subs: [
    new app.Command({
      name: "leaderboard",
      aliases: ["top", "lb", "ladder", "rank"],
      description: "The leaderboard",
      channelType: "all",
      async run(message) {
        const itemCountByPage = 15
        const minNoteCount = 1

        new app.DynamicPaginator({
          channel: message.channel,
          fetchPageCount: async () => {
            const total = await app.noteLadder.fetchCount(minNoteCount)
            return Math.ceil(total / itemCountByPage)
          },
          fetchPage: async (pageIndex) => {
            const page = await app.noteLadder.fetchPage({
              page: pageIndex,
              itemCountByPage,
              minScore: minNoteCount,
            })

            if (page.length === 0)
              return `${app.emote(message, "DENY")} No ladder available.`

            return new app.MessageEmbed()
              .setTitle(`Leaderboard`)
              .setDescription(page.map(app.noteLadder.formatLine).join("\n"))
          },
        })
      },
    }),
  ],
})
