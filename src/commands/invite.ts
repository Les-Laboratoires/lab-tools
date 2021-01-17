import { URL } from "url"
import * as app from "../app"

const command: app.Command = {
  name: "invite",
  aliases: ["invitation", "bot", "cobaye"],
  args: [
    {
      name: "here",
      aliases: ["h"],
      flag: true,
    },
  ],
  async run(message) {
    const here = message.args.here as boolean

    let bot: app.User | false = false

    if (message.mentions.members && message.mentions.members.size > 0) {
      bot = (message.mentions.members.first() as app.GuildMember).user
    } else if (/^\d+$/.test(message.content)) {
      bot = await message.client.users.fetch(message.args.rest, false, true)
    }

    if (!bot) {
      return message.channel.send(
        "Tu dois donner un identifiant valide ou mentionner un bot !"
      )
    }

    const url = new URL("/oauth2/authorize", "https://discord.com/")

    url.searchParams.append("scope", "bot")
    url.searchParams.append("client_id", bot.id)

    if (here) {
      url.searchParams.append("permissions", "0")
      url.searchParams.append("guild_id", message.guild.id)
    } else {
      url.searchParams.append("permissions", "2146958847")
    }

    await message.channel.send(
      new app.MessageEmbed()
        .setAuthor(
          `Invitez ${bot.username} ${here ? "ici" : ""}`,
          message.guild.iconURL({ dynamic: true }) ?? undefined,
          url.toString()
        )
        .setDescription(
          app.code(
            JSON.stringify(
              Object.fromEntries(url.searchParams.entries()),
              (key, val) => {
                if (
                  /^\d+$/.test(val) &&
                  val.length < 12 &&
                  !val.startsWith("0")
                )
                  return Number(val)
                return val
              },
              2
            ),
            "json"
          )
        )
        .setThumbnail(bot.displayAvatarURL({ dynamic: true }))
        .setURL(url.toString())
    )
  },
}

module.exports = command
