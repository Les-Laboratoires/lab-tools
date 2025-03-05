import { code } from "discord-eval.ts"
import { EmbedBuilder, User } from "discord.js"
import { URL } from "node:url"

import { Command, isGuildMessage, positional } from "#core/index"

export default new Command({
  name: "invite",
  description: "Generate an invitation link",
  aliases: ["invitation", "bot", "cobaye"],
  channelType: "all",
  positional: [
    positional({
      name: "bot",
      type: "user",
      validate: (user) => user.bot,
      description: "Bot to invite",
      validationErrorMessage: "User must be a bot.",
    }),
  ],
  flags: [
    {
      name: "here",
      flag: "H",
      description: "Generate link for the current guild",
    },
  ],
  async run(message) {
    const here: boolean = message.args.here
    const bot: User = message.args.bot

    const url = new URL("/oauth2/authorize", "https://discord.com/")

    url.searchParams.append("scope", "bot applications.commands")
    url.searchParams.append("client_id", bot.id)

    if (here && isGuildMessage(message)) {
      url.searchParams.append("permissions", "0")
      url.searchParams.append("guild_id", message.guild.id)
    } else {
      url.searchParams.append("permissions", "2146958847")
    }

    await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Invitez ${bot.username} ${here ? "ici" : ""}`,
            iconURL: message.guild?.iconURL() ?? undefined,
            url: url.toString(),
          })
          .setDescription(
            await code.stringify({
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
                2,
              ),
              lang: "json",
            }),
          )
          .setThumbnail(bot.displayAvatarURL())
          .setURL(url.toString()),
      ],
    })
  },
})
