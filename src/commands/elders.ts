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
    app.isAlreadyUsed(() => used),
  ],
  async run(message) {
    used = true

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
    )

    const config = await app.getConfig(message.guild, true)

    const pattern = config.elders_role_pattern as string

    const roles = Array.from(
      (await message.guild.roles.fetch())
        .filter((role) => role.name.includes(pattern))
        .sort((a, b) => a.comparePositionTo(b))
        .values()
    )

    const members = Array.from(
      (await message.guild.members.fetch({ force: true })).values()
    )

    await waiting.edit(
      `${app.emote(message, "WAIT")} Looking for new elders...`
    )

    const logs: string[] = []

    for (const member of members) {
      if (member.user.bot) continue

      const memberRoles: string[] = member.roles.cache
        .filter((role) => !role.name.includes(pattern))
        .map((role) => role.id)

      let changed = false

      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]

        // member is too recent
        if (app.dayjs().diff(member.joinedAt, "years", true) < i + 1) break

        // member already has role
        if (member.roles.cache.has(role.id)) continue

        // add role
        {
          memberRoles.push(role.id)

          logs.push(`**${member.user.tag}** is **${i + 1}** years old!`)
        }

        changed = true
      }

      const index = members.indexOf(member)

      await app.sendProgress(
        waiting,
        index,
        members.length,
        "Looking for new elders... (`$%` %)"
      )

      if (changed) await member.roles.set(memberRoles).catch()
    }

    message.guild.members.cache.clear()

    if (logs.length === 0) {
      used = false

      return waiting.edit(`${app.emote(message, "DENY")} Not new elders found.`)
    }

    await waiting.delete().catch()

    new app.Paginator({
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
      middlewares: [
        app.staffOnly(),
        app.hasConfigKey("elders_role_pattern"),
        app.isAlreadyUsed(() => used),
      ],
      async run(message) {
        used = true

        const waiting = await message.send(
          `${app.emote(message, "WAIT")} Removing elders...`
        )

        const config = await app.getConfig(message.guild, true)

        const pattern = config.elders_role_pattern as string

        const roles = Array.from(
          (await message.guild.roles.fetch())
            .filter((role) => role.name.includes(pattern))
            .sort((a, b) => a.comparePositionTo(b))
            .values()
        ).map((role) => role.id)

        const members = Array.from(
          (await message.guild.members.fetch({ force: true })).values()
        )

        for (const member of members) {
          if (member.user.bot && member.roles.cache.hasAny(...roles)) {
            await member.roles
              .set(
                member.roles.cache
                  .filter((role) => !roles.includes(role.id))
                  .map((role) => role.id)
              )
              .catch()

            const index = members.indexOf(member)

            await app.sendProgress(
              waiting,
              index,
              members.length,
              "Resetting elders... (`$%` %)"
            )
          }
        }

        used = false

        return waiting.edit(
          `${app.emote(message, "CHECK")} Successfully reset elders.`
        )
      },
    }),
  ],
})
