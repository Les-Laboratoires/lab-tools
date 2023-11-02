import * as app from "../app.js"

import lab from "../tables/lab.js"

/**
 * @Todo use forum channels instead...
 */
export async function updateLabsInAffiliationChannels(
  message: app.GuildMessage,
  packSize: number,
) {
  const labs = await lab.query.select()

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
          `${app.emote(message, "CHECK")} Updated **${guild}** affiliations`,
        )
      }
    }
  }

  await message.channel.send(
    `${app.emote(message, "CHECK")} Successfully updated all affiliations.`,
  )
}

export async function sendLabList(
  channel: app.TextBasedChannel,
  packSize: number,
) {
  const labs = await lab.query.select()

  const pages = app.divider(labs, packSize)

  if (channel.isTextBased()) {
    for (const page of pages)
      await channel.send(
        page.map((lab) => `${lab.title} ${lab.url}`).join("\n"),
      )
  }
}

export async function isIgnored(id: string): Promise<boolean> {
  const guild = await app.getGuild({ id }, true)
  return (await lab.query.where("guild_id", guild._id).first())?.ignored ?? true
}
