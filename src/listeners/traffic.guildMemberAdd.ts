import { Listener } from "#core/listener"
import { cache } from "#core/util"
import { isIgnored, sendLabList } from "#namespaces/labs"
import {
  applyAutoRoles,
  embedReplacers,
  getGuild,
  getUser,
  removeItem,
  sendLog,
  sendTemplatedEmbed,
} from "#namespaces/tools"

import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

export default new Listener({
  event: "guildMemberAdd",
  description: "Prepares to welcome a new member",
  async run(member) {
    if (!cache.ensure<boolean>("turn", true)) return
    if (await isIgnored(member.guild.id)) return

    const usersJoined: string[] = cache.ensure("usersJoined", [])
    const usersLeft: string[] = cache.ensure("usersLeft", [])

    if (usersJoined.includes(member.id)) return
    usersJoined.push(member.id)
    removeItem(usersLeft, member.id)

    const config = await getGuild(member.guild, { forceExists: true })

    await applyAutoRoles(member)

    if (member.user.bot) {
      if (config.bot_role_id)
        await member.roles
          .add(config.bot_role_id)
          .catch((error) => error(error, __filename))

      if (config.general_channel_id && config.bot_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable())
          await sendTemplatedEmbed(
            general,
            config.bot_welcome_message,
            embedReplacers(member),
          )
      }
    } else {
      if (config.member_role_id)
        await member.roles
          .add(config.member_role_id)
          .catch((error) => error(error, __filename, true))

      if (config.member_welcome_direct_message) {
        try {
          const dm = await member.createDM(true)

          await sendTemplatedEmbed(
            dm,
            config.member_welcome_direct_message,
            embedReplacers(member),
          )
        } catch {}
      }

      if (config.general_channel_id && config.member_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable())
          await sendTemplatedEmbed(
            general,
            config.member_welcome_message,
            embedReplacers(member),
          )
      }

      if (!(await getUser(member))) {
        try {
          const message = await member.send(
            "Welcome to the **Les Laboratoires** network.\nOne of these servers may be of interest to you!",
          )

          if (message.channel.isSendable())
            await sendLabList(message.channel, 10)
        } catch {}
      }
    }

    return sendLog(
      member.guild,
      `${member.user} is a new **${member.user.bot ? "bot" : "member"}**.`,
      config,
    )
  },
})
