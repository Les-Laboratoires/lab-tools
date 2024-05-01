import * as app from "#app"

import lab from "#tables/lab.js"

export const allLabsCache = new app.ResponseCache(
  async () => lab.query.select(),
  60_000,
)

/**
 * @Todo use forum channels instead...
 */
export async function updateLabsInAffiliationChannels(
  message: app.GuildMessage,
  packSize: number,
) {
  const labs = await allLabsCache.get()

  const pages = app.divider(labs, packSize)

  for (const guild of message.client.guilds.cache.values()) {
    const config = await app.getGuild(guild)

    if (config?.affiliation_channel_id) {
      const channel = guild.channels.cache.get(config.affiliation_channel_id)

      if (channel?.isTextBased()) {
        const messages = await channel.messages.fetch()

        for (const m of messages.values()) await m.delete()

        for (const page of pages)
          await channel.send(
            page.map((lab) => `${lab.title} ${lab.url}`).join("\n"),
          )

        await message.channel.send(
          `${app.emote(message, "CheckMark")} Updated **${guild}** affiliations`,
        )
      }
    }
  }

  await message.channel.send(
    `${app.emote(message, "CheckMark")} Successfully updated all affiliations.`,
  )
}

export async function sendLabList(
  channel: app.TextBasedChannel,
  packSize: number,
) {
  const labs = await allLabsCache.get()

  const pages = app.divider(labs, packSize)

  if (pages.length === 0)
    return channel.send(`${app.emote(channel, "Cross")} No labs found.`)

  if (channel.isTextBased()) {
    for (const page of pages)
      await channel.send(
        page.map((lab) => `${lab.title} ${lab.url}`).join("\n"),
      )
  }
}

const ignoredCache = new app.ResponseCache(async (id: string) => {
  return lab.query
    .where("guild_id", id)
    .first()
    .then((lab) => !!lab?.ignored)
}, 60_000)

export async function isIgnored(id: string): Promise<boolean> {
  return ignoredCache.get(id)
}
