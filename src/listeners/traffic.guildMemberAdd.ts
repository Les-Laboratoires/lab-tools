import * as app from "#app"

import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  description: "Prepares to welcome a new member",
  async run(member) {
    if (!app.cache.ensure<boolean>("turn", true)) return
    if (await app.isIgnored(member.guild.id)) return

    const config = await app.getGuild(member.guild, { forceExists: true })

    await app.applyAutoRoles(member)

    if (member.user.bot) {
      if (config.bot_role_id)
        await member.roles
          .add(config.bot_role_id)
          .catch((error) => app.error(error, __filename))

      if (config.general_channel_id && config.bot_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable())
          await app.sendTemplatedEmbed(
            general,
            config.bot_welcome_message,
            app.embedReplacers(member),
          )
      }
    } else {
      if (config.member_role_id)
        await member.roles
          .add(config.member_role_id)
          .catch((error) => app.error(error, __filename))

      if (config.member_welcome_direct_message) {
        try {
          const dm = await member.createDM(true)

          await app.sendTemplatedEmbed(
            dm,
            config.member_welcome_direct_message,
            app.embedReplacers(member),
          )
        } catch (error) {}
      }

      if (config.general_channel_id && config.member_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable())
          await app.sendTemplatedEmbed(
            general,
            config.member_welcome_message,
            app.embedReplacers(member),
          )
      }

      if (!(await app.getUser(member))) {
        try {
          const message = await member.send(
            "Welcome to the **Les Laboratoires** network.\nOne of these servers may be of interest to you!",
          )

          if (message.channel.isSendable())
            await app.sendLabList(message.channel, 10)
        } catch (error) {}
      }
    }

    return app.sendLog(
      member.guild,
      `${member.user} is a new **${member.user.bot ? "bot" : "member"}**.`,
      config,
    )
  },
}

export default listener
