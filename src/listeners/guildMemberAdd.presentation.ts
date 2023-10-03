import * as app from "../app.js"

import chalk from "chalk"

import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  description: "Prepares to welcome a new member",
  async run(member) {
    const config = await app.getGuild(member.guild, true)

    await app.applyAutoRoles(member)

    if (member.user.bot) {
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
    } else {
      if (config.member_role_id)
        await member.roles
          .add(config.member_role_id)
          .catch((error) => app.error(error, __filename))

      if (config.general_channel_id && config.member_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id
        )

        if (general)
          await app.sendTemplatedEmbed(
            general,
            config.member_welcome_message,
            app.embedReplacers(member)
          )
      }
    }

    if (
      member.client.guilds.cache.filter((guild) =>
        guild.members.cache.has(member.id)
      ).size <= 1
    ) {
      try {
        const message = await member.send(
          "Welcome to the **Les Laboratoires** network.\nOne of these servers may be of interest to you!"
        )

        await app.sendLabList(message.channel)
      } catch (error) {
        app.error(
          `cannot send messages from ${chalk.blueBright(
            member.guild.name
          )} to ${chalk.blueBright(member.user.tag)}`,
          __filename
        )
      }
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
