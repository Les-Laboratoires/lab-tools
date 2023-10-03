import * as app from "../app.js"

import note, { userNote, graphicalNote } from "../tables/note.js"
import users from "../tables/user.js"

async function noteEmbed(target: app.User) {
  const { count, avg } = await userNote(target)

  return new app.MessageEmbed()
    .setAuthor({
      name: `Note of ${target.tag}`,
      iconURL: target.displayAvatarURL({ dynamic: true }),
    })
    .setDescription(`${graphicalNote(avg)} **${avg?.toFixed(2) ?? 0}** / 5`)
    .setFooter({ text: `Total: ${count ?? 0} notes` })
}

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
          from: fromUser._id,
          to: toUser._id,
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

      return message.send({ embeds: [await noteEmbed(message.args.user)] })
    }

    return message.send({ embeds: [await noteEmbed(message.author)] })
  },
})
