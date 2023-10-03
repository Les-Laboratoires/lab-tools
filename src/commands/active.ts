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

    const config = await app.getGuild(message.guild, true)

    message.guild.members.cache.clear()

    const members = (await message.guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => member)

    message.guild.members.cache.clear()

    await waiting.edit(
      `${app.emote(message, "WAIT")} Verification of 0/${
        members.length
      } members...`
    )

    let activeCount = 0

    for (const member of members) {
      const isActive = await app.isActive(member)

      await member.fetch(true)

      if (isActive) {
        activeCount++

        if (!member.roles.cache.has(config.active_role_id!))
          await member.roles.add(config.active_role_id!)
      } else if (member.roles.cache.has(config.active_role_id!)) {
        await member.roles.remove(config.active_role_id!)
      }

      await app.sendProgress(
        waiting,
        members.indexOf(member),
        members.length,
        `Verification of $#/$$ members...`,
        10
      )
    }

    used = false

    return waiting.edit(
      `${app.emote(
        message,
        "CHECK"
      )} Successfully applied active role to **${activeCount}** active members.`
    )
  },
})
