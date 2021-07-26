import * as app from "../app"

export default new app.Command({
  name: "elders",
  aliases: ["elder", "old"],
  description: "The elders command",
  channelType: "guild",
  middlewares: [app.staffOnly(), app.hasConfigKey("elders_role_pattern")],
  async run(message) {
    const config = await app.getConfig(message.guild, true)

    const roles = message.guild.roles.cache.filter((role) =>
      role.name.includes(config.elders_role_pattern as string)
    )

    const members = await message.guild.members.fetch()

    const logs: string[] = []

    await Promise.all(
      roles.array().map(async (role, i) => {
        for (const [, member] of members) {
          if (member.user.bot) continue

          if (
            Date.now() - (member.joinedTimestamp as number) <
            1000 * 60 * 60 * 24 * 365 * (i + 1)
          )
            continue

          if (member.roles.cache.has(role.id)) continue

          await member.roles.add(role).catch(app.error)

          logs.push(
            `**${member.user.tag}** has been present for over **${
              i + 1
            }** years!`
          )
        }
      })
    )

    new app.Paginator({
      customEmojis: {
        start: app.Emotes.LEFT,
        previous: app.Emotes.MINUS,
        next: app.Emotes.PLUS,
        end: app.Emotes.RIGHT,
      },
      channel: message.channel,
      pages: app.Paginator.divider(logs, 15).map((page) => page.join("\n")),
    })
  },
})
