import * as app from "../app.js"

export interface GlobalBan {
  id: string
  reason: string | null
}

const bans = new app.Table<GlobalBan>({
  name: "bans",
  description: "The bans table",
  setup: (table) => {
    table.string("id").unique().notNullable()
    table.string("reason")
  },
})

export async function addGlobalBan(
  user: app.PartialUser | app.User,
  reason?: string
) {
  await bans.query.insert({ id: user.id, reason }).onConflict("id").merge()

  await user.send(
    `${app.emote(
      user,
      "MINUS"
    )} You are globally banned from **Les Laboratoires** network.`
  )
}

export async function updateBans(
  client: app.Client,
  onLog?: (log: string) => unknown
) {
  const globalBans = await bans.query.select()

  for (const [, guild] of client.guilds.cache) {
    const guildBans = await guild.bans.fetch()

    for (const globalBan of globalBans) {
      if (guildBans.every((guildBan) => guildBan.user.id !== globalBan.id)) {
        try {
          await guild.members.ban(globalBan.id, {
            reason: globalBan.reason ?? undefined,
          })

          onLog?.(
            `${app.emote(guild, "CHECK")} Banned \`${
              globalBan.id
            }\` from **${guild}**`
          )
        } catch (error: any) {
          onLog?.(
            `${app.emote(guild, "DENY")} Not banned \`${
              globalBan.id
            }\` from **${guild}**${app.code.stringify({
              content: `${error.name}: ${error.message}`,
              lang: "js",
            })}`
          )
        }
      }
    }
  }
}

export default bans
