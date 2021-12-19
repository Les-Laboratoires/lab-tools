import * as app from "../app.js"

import users from "../tables/users.js"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  description: "Prepares to welcome a new member",
  async run(member) {
    await users.query.insert({ id: member.id }).onConflict("id").ignore()

    const userData = await users.query.where({ id: member.id }).first()

    const config = await app.getConfig(member.guild, true)

    if (
      userData &&
      userData.presentation_id &&
      userData.presentation_guild_id
    ) {
      if (!member.user.bot) {
        const guild = this.guilds.cache.get(userData.presentation_guild_id)

        if (guild) {
          const subConfig = await app.getConfig(guild, true)

          if (
            subConfig.await_validation_role_id &&
            subConfig.presentation_channel_id
          ) {
            const channel = this.channels.cache.get(
              subConfig.presentation_channel_id
            )

            if (channel?.isText()) {
              const presentation = await channel.messages.fetch(
                userData.presentation_id
              )

              if (presentation)
                await app.approveMember(member, presentation, config)
            }
          }
        }
      }
    } else if (member.user.bot) {
      await app.applyAutoRoles(member)

      if (config.bot_role_id)
        await member.roles
          .add(config.bot_role_id)
          .catch((error) => app.error(error, __filename))

      if (config.general_channel_id && config.bot_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id
        )

        if (general)
          await app.sendTemplatedEmbed(
            general,
            config.bot_welcome_message,
            app.embedReplacers(member)
          )
      }
    } else if (
      !config.await_validation_role_id ||
      !config.presentation_channel_id
    )
      await app.approveMember(member, undefined, config)

    if (
      member.client.guilds.cache.filter((guild) =>
        guild.members.cache.has(member.id)
      ).size <= 1
    ) {
      const { channel: dm } = await member.send(
        "Welcome to the **Les Laboratoires** network.\nOne of these servers may be of interest to you!"
      )

      await app.sendLabList(dm)
    }

    return app.sendLog(
      member.guild,
      `**${member.user.tag}** is a new **${
        member.user.bot ? "bot" : "member"
      }**.`,
      config
    )
  },
}

export default listener
