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

  if (!config || !config.auto_ban_channel_id) return

  if (message.channel.id === config.auto_ban_channel_id) {
    const guilds = message.client.guilds.cache.filter((guild) =>
      guild.members.me?.permissions.has(
        app.PermissionFlagsBits.BanMembers,
        true,
      ),
    )

    const result = await Promise.allSettled(
      guilds.map(async (guild) => {
        try {
          await guild.bans.create(message.author.id, {
            reason: "Spamming",
            // delete all messages from the user in the last 5 hours
            deleteMessageSeconds: 60 * 60 * 5,
          })
        } catch (error: any) {
          await app.sendLog(
            guild,
            `<@&${guild.id}> **${
              message.author.tag
            }** could not be banned for spamming...${app.code.stringify({
              content: error.message,
              lang: "js",
            })}`,
            config,
          )

          throw error
        }

        await app.sendLog(
          guild,
          `**${message.author.tag}** has been banned here for spamming in **${guild.name}**`,
          config,
        )
      }),
    )

    if (config.general_channel_id) {
      const general = message.client.channels.cache.get(
        config.general_channel_id,
      )

      if (general?.isTextBased()) {
        const success = result.filter(
          (result) => result.status === "fulfilled",
        ).length
        const errored = result.length - success

        if (success > 0 && errored === 0) {
          await general.send(
            `${app.emote(message, "CheckMark")} **${
              message.author.tag
            }** detected as a spammer and banned from **${success}** labs.`,
          )
        } else if (success > 0 && errored > 0) {
          await general.send(
            `${app.emote(message, "CheckMark")} **${
              message.author.tag
            }** detected as a spammer and banned from **${success}** labs.\n> **${errored}** labs failed to ban the user.`,
          )
        } else {
          await general.send(
            `${app.emote(message, "Cross")} **${
              message.author.tag
            }** detected as a spammer but all labs failed to ban the user.`,
          )
        }
      }
    }
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
