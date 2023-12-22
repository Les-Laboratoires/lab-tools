import * as app from "../app"

/**
 * string is the author id
 */
const spamMessages: Record<
  string,
  Array<[channelId: string, timestamp: number]>
> = {}

const detectionPeriod = 1000

const cleanSpamMessages = () => {
  for (const key in spamMessages) {
    spamMessages[key] = spamMessages[key].filter(
      ([, timestamp]) => timestamp < Date.now() - detectionPeriod,
    )
  }
}

export function detectAndBanSpammer(message: app.Message): void {
  if (message.author.bot) return

  const key = message.author.id

  if (!spamMessages[key]) spamMessages[key] = []

  spamMessages[key].push([message.channel.id, message.createdTimestamp])

  cleanSpamMessages()

  if (
    spamMessages[key].length > 10 ||
    new Set(spamMessages[key].map(([channelId]) => channelId)).size > 5
  ) {
    message.channel.send(
      `${app.emote(message, "DISAPPROVED")} **${
        message.author.tag
      }** will be banned for spamming.`,
    )

    message.client.guilds.cache
      .filter((guild) => guild.members.me?.permissions.has("BanMembers", true))
      .forEach((guild) => {
        guild.members
          .ban(message.author.id, {
            reason: "Spamming",
            deleteMessageSeconds: 10,
          })
          .then(() => {
            return app.sendLog(
              guild,
              `**${message.author.tag}** has been banned for spamming.`,
            )
          })
          .catch()
      })
  }

  if (spamMessages[key].length === 0) delete spamMessages[key]
}
