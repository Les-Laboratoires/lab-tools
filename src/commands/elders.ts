import * as app from "../app.js"

export default new app.Command({
  name: "elders",
  aliases: ["elder", "old"],
  description: "The elders command",
  channelType: "guild",
  middlewares: [app.staffOnly(), app.hasConfigKey("elders_role_pattern")],
  async run(message) {
    const config = await app.getConfig(message.guild, true)

    const pattern = config.elders_role_pattern as string

    const roles = Array.from(
      message.guild.roles.cache
        .filter((role) => role.name.includes(pattern))
        .sort((a, b) => a.comparePositionTo(b))
        .values()
    )

    const members = await message.guild.members.fetch({ force: true })

    const logs: string[] = []

    for (const [, member] of members) {
      if (member.user.bot) continue

      const memberRoles: string[] = member.roles.cache
        .filter((role) => !role.name.includes(pattern))
        .map((role) => role.id)

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
      }

      if (memberRoles.length > 0) await member.roles.set(memberRoles)
    }

    message.guild.members.cache.clear()

    new app.Paginator({
      customEmojis: {
        start: app.Emotes.LEFT,
        previous: app.Emotes.MINUS,
        next: app.Emotes.PLUS,
        end: app.Emotes.RIGHT,
      },
      channel: message.channel,
      pages: app.Paginator.divider(logs, 10).map((page, index, pages) =>
        new app.MessageEmbed()
          .setDescription(page.join("\n"))
          .setTitle(`Added ${logs.length} elders`)
          .setFooter(`Page: ${index + 1} sur ${pages.length}`)
      ),
    })
  },
  subs: [
    new app.Command({
      name: "reset",
      description: "Reset elders",
      channelType: "guild",
      middlewares: [app.staffOnly(), app.hasConfigKey("elders_role_pattern")],
      async run(message) {
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

        return message.send(
          `${app.emote(message, "CHECK")} Successfully reset elders.`
        )
      },
    }),
  ],
})
