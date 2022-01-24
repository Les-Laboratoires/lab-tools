import * as app from "../app.js"

import lab from "../tables/lab.js"

export async function updateLabsInAffiliationChannels(
  message: app.NormalMessage
) {
  const labs = await lab.query.select()

  const pages = app.divider(labs, 6)

  for (const guild of message.client.guilds.cache.values()) {
    const config = await app.getConfig(guild)

    if (config?.affiliation_channel_id) {
      const channel = guild.channels.cache.get(config.affiliation_channel_id)

      if (channel?.isText()) {
        const messages = await channel.messages.fetch()

        for (const m of messages.values()) await m.delete()

        for (const page of pages)
          await channel.send(
            page.map((lab) => `${lab.title} ${lab.url}`).join("\n")
          )

        await message.send(
          `${app.emote(message, "CHECK")} Updated **${guild}** affiliations`
        )
      }
    }
  }

  await message.send(
    `${app.emote(message, "CHECK")} Successfully updated all affiliations.`
  )
}

export async function sendLabList(channel: app.TextBasedChannel) {
  const labs = await lab.query.select()

  const pages = app.divider(labs, 6)

  if (channel.isText()) {
    for (const page of pages)
      await channel.send(
        page.map((lab) => `${lab.title} ${lab.url}`).join("\n")
      )
  }
}
