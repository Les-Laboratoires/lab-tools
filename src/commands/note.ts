import * as app from "../app.js"

import note from "../tables/note.js"

export default new app.Command({
  name: "note",
  description: "Note management",
  channelType: "all",
  positional: [
    app.positional({
      name: "user",
      description: "The noted user",
      type: "user",
      validate: (value, message) => {
        return (
          (value !== message.author && value !== undefined) ||
          "You can't target yourself."
        )
      },
    }),
    app.positional({
      name: "note",
      description: "Note from 0 to 5",
      type: "number",
      validate: (note) => note >= 0 && note <= 5 && Number.isInteger(note),
    }),
  ],
  async run(message) {
    if (message.args.user) {
      if (message.args.note !== null) {
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

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully noted.`
        )
      }

      return message.channel.send({
        embeds: [await app.noteEmbed(message.args.user)],
      })
    }

    return message.channel.send({
      embeds: [await app.noteEmbed(message.author)],
    })
  },
  subs: [app.noteLadder.generateCommand()],
})
