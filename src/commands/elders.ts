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
    app.isNotInUse(() => used),
  ],
  async run(message) {
    used = true

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
    )

    const config = await app.getConfig(message.guild, true)

    const pattern = config.elders_role_pattern as string

    const elderRoles = (
      await message.guild.roles.fetch(undefined, { force: true, cache: true })
    )
      .filter((role) => role.name.includes(pattern))
      .sort((a, b) => a.comparePositionTo(b))
      .map((role) => role.id)

    message.guild.members.cache.clear()

    const members = (await message.guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => member)

    await waiting.edit(
      `${app.emote(message, "WAIT")} Looking for new elders...`
    )

    const logs: string[] = []

    for (const member of members) {
      const memberRoles: string[] = member.roles.cache
        .filter((role) => !elderRoles.includes(role.id))
        .map((role) => role.id)

      let changed = false,
        maxYear = 0

      for (const elderRoleId of elderRoles) {
        const index = elderRoles.indexOf(elderRoleId),
          years = index + 1

        if (
          app
            .dayjs()
            .diff(member.joinedAt || member.joinedTimestamp, "years", true) >=
          years
        ) {
          memberRoles.push(elderRoleId)
          maxYear = Math.max(maxYear, years)
          changed = true
        }
      }

      if (changed) {
        await member.roles
          .set(memberRoles)
          .then(() => {
            logs.push(`**${member.user.tag}** is **${maxYear}** years old!`)
          })
          .catch((err) =>
            logs.push(`**${member.user.tag}** error: \`${err.message}\``)
          )

        const index = members.indexOf(member)

        await app.sendProgress(
          waiting,
          index,
          members.length,
          "Looking for new elders... (`$%` %)"
        )
      }
    }

    message.guild.members.cache.clear()

    if (logs.length === 0) {
      used = false

      return waiting.edit(`${app.emote(message, "DENY")} Not new elders found.`)
    }

    await waiting.delete().catch()

    new app.StaticPaginator({
      channel: message.channel,
      pages: app.divider(logs, 10).map((page, index, pages) =>
        new app.MessageEmbed()
          .setDescription(page.join("\n"))
          .setTitle(
            `Added ${
              logs.filter((log) => !log.includes("error:")).length
            } elders`
          )
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
        app.isNotInUse(() => used),
      ],
      async run(message) {
        used = true

        const waiting = await message.send(
          `${app.emote(message, "WAIT")} Removing elders...`
        )

        const config = await app.getConfig(message.guild, true)

        const pattern = config.elders_role_pattern as string

        const roles = (await message.guild.roles.fetch())
          .filter((role) => role.name.includes(pattern))
          .sort((a, b) => a.comparePositionTo(b))
          .map((role) => role.id)

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
