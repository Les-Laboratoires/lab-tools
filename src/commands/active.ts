import * as app from "../app.js"

let used = false

export default new app.Command({
  name: "active",
  description: "Update the active list",
  channelType: "guild",
  middlewares: [
    app.staffOnly(),
    app.hasConfigKey("active_role_id"),
    app.isNotInUse(() => used),
  ],
  async run(message) {
    used = true

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
    )

    const config = await app.getConfig(message.guild, true)

    const members = (await message.guild.members.fetch()).filter(
      (member) => !member.user.bot
    )

    await waiting.edit(
      `${app.emote(message, "WAIT")} Looking for active members...`
    )

    for (const [, member] of members) {
      const isActive = await app.isActive(member)

      if (isActive) {
        if (!member.roles.cache.has(config.active_role_id!))
          await member.roles.add(config.active_role_id!)
      } else if (member.roles.cache.has(config.active_role_id!)) {
        await member.roles.remove(config.active_role_id!)
      }
    }

    used = false

    return waiting.edit(
      `${app.emote(
        message,
        "CHECK"
      )} Successfully applied active role to active members.`
    )
  },
})
