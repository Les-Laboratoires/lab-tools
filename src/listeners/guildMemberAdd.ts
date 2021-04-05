import * as app from "../app"

import guilds from "../tables/guilds"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    const guildData = await guilds.query
      .select()
      .where("id", member.guild.id)
      .first()

    if (!guildData) {
      await guilds.query.insert({
        id: member.guild.id,
      })
      return
    }

    if (!guildData.general_channel_id) return

    const general = member.guild.channels.cache.get(
      guildData.general_channel_id
    )

    if (!general?.isText())
      return app.warn(
        `general channel of "${member.guild.name}" guild is not available`,
        "system"
      )

    const key = member.user.bot ? "bot" : "member"

    // @ts-ignore
    if (guildData[`${key}_default_role`]) {
      // @ts-ignore
      await member.roles.add(guildData[`${key}_default_role`])
    }

    // @ts-ignore
    if (guildData[`${key}_welcome_message`]) {
      try {
        // @ts-ignore
        await general.send(JSON.parse(guildData[`${key}_welcome_message`]))
      } catch (error) {
        // @ts-ignore
        await general.send(guildData[`${key}_welcome_message`])
      }
    }
  },
}

module.exports = listener
