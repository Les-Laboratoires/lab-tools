import * as app from "#app"

import message from "../tables/message.js"

export async function updateGuildMemberCountTracker(guild: app.Guild) {
  if (process.env.BOT_MODE === "dev") return

  const config = await app.getGuild(guild)

  if (config?.member_tracker_channel_id) {
    const channel = await guild.channels.fetch(config.member_tracker_channel_id)

    if (channel) {
      const members = await guild.members.fetch()

      guild.members.cache.clear()

      await channel.setName(
        config.member_tracker_pattern.replace(
          "$n",
          app.shortNumber(members.size),
        ),
      )
    }
  }
}

export async function updateGuildMessageCountTracker(guild: app.Guild) {
  if (process.env.BOT_MODE === "dev") return

  const config = await app.getGuild(guild)

  if (config?.message_tracker_channel_id) {
    const channel = await guild.channels.fetch(
      config.message_tracker_channel_id,
    )

    if (channel) {
      const messages = await message.count(`guild_id = ${config._id}`)

      await channel.setName(
        config.message_tracker_pattern.replace("$n", app.shortNumber(messages)),
      )
    }
  }
}

export async function updateGuildOnlineCountTracker(guild: app.Guild) {
  if (process.env.BOT_MODE === "dev") return

  const config = await app.getGuild(guild)

  if (config?.online_tracker_channel_id) {
    const channel = await guild.channels.fetch(config.online_tracker_channel_id)

    if (channel) {
      const members = await guild.members.fetch({
        withPresences: true,
      })

      guild.members.cache.clear()

      const onlineMembers = members.filter(
        (member) => !!member.presence && member.presence.status !== "offline",
      )

      await channel.setName(
        config.online_tracker_pattern.replace(
          "$n",
          app.shortNumber(onlineMembers.size),
        ),
      )
    }
  }
}
