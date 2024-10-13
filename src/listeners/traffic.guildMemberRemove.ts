import * as app from "#app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  description: "Announces when a member leaves the server",
  async run(member) {
    if (!app.cache.ensure<boolean>("turn", true)) return
    if (await app.isIgnored(member.guild.id)) return

    const config = await app.getGuild(member.guild)

    if (!config) return

    if (member.user.bot) {
      if (config.general_channel_id && config.bot_leave_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable()) {
          await app.sendTemplatedEmbed(
            general,
            config.bot_leave_message,
            app.embedReplacers(member),
          )
        }
      }
    } else {
      if (member.guild.bans.cache.has(member.id)) return

      if (config.general_channel_id && config.member_leave_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable()) {
          await app.sendTemplatedEmbed(
            general,
            config.member_leave_message,
            app.embedReplacers(member),
          )
        }
      }
    }
  },
}

export default listener
