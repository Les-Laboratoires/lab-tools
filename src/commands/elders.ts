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
  flags: [
    {
      flag: "f",
      name: "force",
      description: "Force the update of all members",
    },
  ],
  async run(message) {
    used = true

    const waiting = await message.channel.send(
      `${app.emote(message, "WAIT")} Fetching elder roles...`
    )

    const config = await app.getGuild(message.guild, true)

    const pattern = config.elders_role_pattern!

    const elderRoles = (
      await message.guild.roles.fetch(undefined, { force: true, cache: false })
    )
      .filter((role) => role.name.includes(pattern))
      .sort((a, b) => a.comparePositionTo(b))
      .map((role) => role)

    await waiting.edit(`${app.emote(message, "WAIT")} Fetching members...`)

    message.guild.members.cache.clear()

    const members = (await message.guild.members.fetch({ force: true }))
      .filter((member) => !member.user.bot)
      .map((member) => member)

    message.guild.members.cache.clear()

    const logs: string[] = []

    await waiting.edit(
      `${app.emote(message, "WAIT")} Looking for new elders from ${
        members.length
      } members...`
    )

    for (const member of members) {
      await member.fetch(true)

      for (const elderRoleId of elderRoles) {
        const index = elderRoles.indexOf(elderRoleId)
        const years = index + 1

        if (
          app
            .dayjs()
            .diff(member.joinedAt || member.joinedTimestamp, "years", true) >=
          years
        ) {
          if (!member.roles.cache.has(elderRoleId.id)) {
            await member.roles.add(elderRoleId.id)
            logs.push(`**${member.user.tag}** is **${years}** years old!`)
          }
        }

        await app.sendProgress(
          waiting,
          members.indexOf(member),
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
          .setFooter({
            text: `Page: ${index + 1} sur ${pages.length}`,
          })
      ),
    })

    used = false
  },
})
