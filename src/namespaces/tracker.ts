import * as app from "../app.js"

export async function updateGuildMemberCountTracker(guild: app.Guild) {
  const config = await app.getGuild(guild)

  if (config?.member_tracker_channel_id) {
    const channel = await guild.channels.fetch(config.member_tracker_channel_id)

    if (channel) {
      const members = await guild.members.fetch()

      guild.members.cache.clear()

      await channel.setName(
        config.member_tracker_pattern.replace(
          "$n",
          app.shortNumber(members.size)
        )
      )
    }
  }
}

export async function updateGuildMessageCountTracker(guild: app.Guild) {}

export async function updateGuildOnlineCountTracker(guild: app.Guild) {
  const config = await app.getGuild(guild)

  if (config?.online_tracker_channel_id) {
    const channel = await guild.channels.fetch(config.online_tracker_channel_id)

    if (channel) {
      const members = await guild.members.fetch({
        withPresences: true,
      })

      guild.members.cache.clear()

      await channel.setName(
        config.online_tracker_pattern.replace(
          "$n",
          app.shortNumber(
            members.filter(
              (member) =>
                !!member.presence && member.presence.status !== "offline"
            ).size
          )
        )
      )
    }
  }
}
