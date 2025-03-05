import { cache } from "#core/util"
import { Listener } from "#core/listener"
import { isIgnored } from "#namespaces/labs"
import {
  embedReplacers,
  getGuild,
  removeItem,
  sendTemplatedEmbed,
} from "#namespaces/tools"

export default new Listener({
  event: "guildMemberRemove",
  description: "Announces when a member leaves the server",
  async run(member) {
    if (!cache.ensure<boolean>("turn", true)) return
    if (await isIgnored(member.guild.id)) return

    const config = await getGuild(member.guild)

    const usersLeft: string[] = cache.ensure("usersLeft", [])
    const usersJoined: string[] = cache.ensure("usersJoined", [])

    if (usersLeft.includes(member.id)) return
    usersLeft.push(member.id)
    removeItem(usersJoined, member.id)

    if (!config) return

    if (member.user.bot) {
      if (config.general_channel_id && config.bot_leave_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id,
        )

        if (general && general.isSendable()) {
          await sendTemplatedEmbed(
            general,
            config.bot_leave_message,
            embedReplacers(member),
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
          await sendTemplatedEmbed(
            general,
            config.member_leave_message,
            embedReplacers(member),
          )
        }
      }
    }
  },
})
