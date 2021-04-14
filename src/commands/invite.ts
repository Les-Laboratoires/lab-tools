import { URL } from "url"
import * as app from "../app"

const command: app.Command = {
  name: "invite",
  aliases: ["invitation", "bot", "cobaye"],
  description: "Generate an invitation link",
  flags: [
    {
      name: "here",
      flag: "H",
      description: "Generate link to current guild",
    },
  ],
  async run(message) {
    const here = message.args.here

    let bot: app.User | false = false

    if (message.mentions.members && message.mentions.members.size > 0) {
      bot = (message.mentions.members.first() as app.GuildMember).user
    } else if (/^\d+$/.test(message.rest)) {
      bot = await message.client.users.fetch(message.rest, false, true)
    }

    if (!bot) {
      return message.channel.send(
        `${message.client.emojis.resolve(app.Emotes.DENY)} Unknown user`
      )
    }

    const url = new URL("/oauth2/authorize", "https://discord.com/")

    url.searchParams.append("scope", "bot")
    url.searchParams.append("client_id", bot.id)

    if (here && app.isGuildMessage(message)) {
      url.searchParams.append("permissions", "0")
      url.searchParams.append("guild_id", message.guild.id)
    } else {
      url.searchParams.append("permissions", "2146958847")
    }

    await message.channel.send(
      new app.MessageEmbed()
        .setAuthor(
          `Invitez ${bot.username} ${here ? "ici" : ""}`,
          message.guild?.iconURL({ dynamic: true }) ?? undefined,
          url.toString()
        )
        .setDescription(
          app.code.stringify({
            content: JSON.stringify(
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
            lang: "json",
          })
        )
        .setThumbnail(bot.displayAvatarURL({ dynamic: true }))
        .setURL(url.toString())
    )
  },
}

module.exports = command
