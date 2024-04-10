import * as app from "../app.js"

// /**
//  * string is the author id
//  */
// const spamMessages: Record<
//   string,
//   Array<[channelId: string, timestamp: number]>
// > = {}
//
// const detectionPeriod = 1000
//
// const cleanSpamMessages = () => {
//   for (const key in spamMessages) {
//     spamMessages[key] = spamMessages[key].filter(
//       ([, timestamp]) => timestamp < Date.now() - detectionPeriod,
//     )
//   }
// }

export async function detectAndBanSpammer(message: app.Message) {
  if (
    message.system ||
    !message.author ||
    message.author.bot ||
    message.author.system ||
    !message.guildId
  )
    return

  const config = await app.getGuild({ id: message.guildId })

  if (!config) return
  if (!config.auto_ban_channel_id) return

  if (message.channel.id === config.auto_ban_channel_id) {
    const guilds = message.client.guilds.cache.filter(
      (guild) => guild.members.me?.permissions.has("BanMembers", true),
    )

    await Promise.allSettled(
      guilds.map(async (guild) => {
        await guild.members.ban(message.author.id, {
          reason: "Spamming",
          deleteMessageSeconds: 10,
        })

        await app.sendLog(
          guild,
          `**${message.author.tag}** has been banned for spamming from **${guilds.size}** guilds.`,
        )
      }),
    )

    const alert = await message.channel.send(
      `${app.emote(message, "CHECK")} **${
        message.author.tag
      }** detected as a spammer and banned from **${guilds.size}** guilds.`,
    )

    setTimeout(() => {
      alert.delete().catch()
    }, 100 * 1000)
  }
}

// export function detectAndBanSpammer(message: app.Message): void {
//   if (
//     message.system ||
//     !message.author ||
//     message.author.bot ||
//     message.author.system
//   )
//     return
//
//   const key = message.author.id
//
//   if (!spamMessages[key]) spamMessages[key] = []
//
//   spamMessages[key].push([message.channel.id, message.createdTimestamp])
//
//   cleanSpamMessages()
//
//   if (
//     spamMessages[key].length > 10 ||
//     new Set(spamMessages[key].map(([channelId]) => channelId)).size > 5
//   ) {
//     message.channel.send(
//       `${app.emote(message, "DISAPPROVED")} **${
//         message.author.tag
//       }** will be banned for spamming.`,
//     )
//
//     message.client.guilds.cache
//       .filter((guild) => guild.members.me?.permissions.has("BanMembers", true))
//       .forEach((guild) => {
//         guild.members
//           .ban(message.author.id, {
//             reason: "Spamming",
//             deleteMessageSeconds: 10,
//           })
//           .then(() => {
//             return app.sendLog(
//               guild,
//               `**${message.author.tag}** has been banned for spamming.`,
//             )
//           })
//           .catch()
//       })
//   }
//
//   if (spamMessages[key].length === 0) delete spamMessages[key]
// }
