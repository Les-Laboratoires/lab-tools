import * as app from "../app.js"

let used = false

export default new app.Command({
  name: "elders",
  aliases: ["elder", "old"],
  description: "The elders command",
  channelType: "guild",
  middlewares: [
    app.staffOnly(),
    app.hasConfigKey("elders_role_pattern"),
    app.isAlreadyUsed(used),
  ],
  async run(message) {
    used = true

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
    )

    const config = await app.getConfig(message.guild, true)

    const pattern = config.elders_role_pattern as string

    const roles = Array.from(
      message.guild.roles.cache
        .filter((role) => role.name.includes(pattern))
        .sort((a, b) => a.comparePositionTo(b))
        .values()
    )

    const members = await message.guild.members.fetch({ force: true })

    await waiting.edit(
      `${app.emote(message, "WAIT")} Looking for new elders...`
    )

    const logs: string[] = []

    for (const [, member] of members) {
      if (member.user.bot) continue

      const memberRoles: string[] = member.roles.cache
        .filter((role) => !role.name.includes(pattern))
        .map((role) => role.id)

      let changed = false

      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]

        if (
          Date.now() - (member.joinedTimestamp as number) <
          1000 * 60 * 60 * 24 * 365 * (i + 1)
        )
          continue

        if (member.roles.cache.has(role.id)) continue

        memberRoles.push(role.id)

        logs.push(`**${member.user.tag}** is **${i + 1}** years old!`)

        changed = true
      }

      if (changed) await member.roles.set(memberRoles)
    }

    message.guild.members.cache.clear()

    await waiting.delete().catch()

    new app.Paginator({
      placeHolder: "New elders not found.",
      channel: message.channel,
      pages: app.Paginator.divider(logs, 10).map((page, index, pages) =>
        new app.MessageEmbed()
          .setDescription(page.join("\n"))
          .setTitle(`Added ${logs.length} elders`)
          .setFooter(`Page: ${index + 1} sur ${pages.length}`)
      ),
    })

    used = false
  },
  subs: [
    new app.Command({
      name: "reset",
      description: "Reset elders",
      channelType: "guild",
      middlewares: [app.staffOnly(), app.hasConfigKey("elders_role_pattern")],
      async run(message) {
        used = true

        const waiting = await message.send(
          `${app.emote(message, "WAIT")} Removing elders...`
        )

        const config = await app.getConfig(message.guild, true)

        const pattern = config.elders_role_pattern as string

        const roles = Array.from(
          message.guild.roles.cache
            .filter((role) => role.name.includes(pattern))
            .sort((a, b) => a.comparePositionTo(b))
            .values()
        )

        for (const role of roles)
          for (const [, member] of role.members) await member.roles.remove(role)

        used = false

        return waiting.edit(
          `${app.emote(message, "CHECK")} Successfully reset elders.`
        )
      },
    }),
  ],
})
