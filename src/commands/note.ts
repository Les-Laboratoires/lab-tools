import * as app from "../app"

import note, { userNote, graphicalNote } from "../tables/note"

async function noteEmbed(target: app.User) {
  const { count, avg } = await userNote(target)

  return new app.MessageEmbed()
    .setAuthor(
      `Note of ${target.tag}`,
      target.displayAvatarURL({ dynamic: true })
    )
    .setDescription(`${graphicalNote(avg)} **${avg?.toFixed(2) ?? 0}** / 5`)
    .setFooter(`Total: ${count ?? 0} notes`)
}

module.exports = new app.Command({
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

        if (
          await note.query
            .where({
              from: message.author.id,
              to: message.args.user.id,
            })
            .first()
        ) {
          await note.query.update({ value }).where({
            from: message.author.id,
            to: message.args.user.id,
          })
        } else {
          await note.query.insert({
            value,
            from: message.author.id,
            to: message.args.user.id,
          })
        }

        return message.send(
          `${app.emote(message, "CHECK")} Successfully noted.`
        )
      }

      return message.send(await noteEmbed(message.args.user))
    }

    return message.send(await noteEmbed(message.author))
  },
  // subs: [
  //   new app.Command({
  //     name: "list",
  //
  //   })
  // ]
})
