import * as app from "../app.js"

import users from "../tables/users"
import { graphicalNote, userNote } from "../tables/note"

export default new app.Command({
  name: "profile",
  description: "The profile command",
  channelType: "guild",
  aliases: ["user", "about"],
  positional: [
    {
      name: "user",
      description: "Targeted user",
      castValue: "user+",
      default: (message) => message?.author.id as string,
    },
  ],
  async run(message) {
    const user: app.User = message.args.user
    const userData = await users.query.where({ id: user.id }).first()

    if (!userData)
      return message.send(`${app.emote(message, "DENY")} No profile found.`)

    const { count, avg } = await userNote(user)

    return message.send({
      embeds: [
        new app.SafeMessageEmbed()
          .setColor()
          .setAuthor(
            `Profile de ${user.tag}`,
            user.displayAvatarURL({ dynamic: true, size: 32 })
          )
          .setDescription(userData.presentation || "*pas de *")
          .addField(
            `Note (${count ?? 0} notes)`,
            `${graphicalNote(avg)} **${avg?.toFixed(2) ?? 0}** / 5`
          ),
      ],
    })
  },
})
