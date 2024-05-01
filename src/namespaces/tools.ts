import * as app from "#app"

import users, { User } from "#tables/user.js"
import guilds, { Guild } from "#tables/guild.js"
import autoRole from "#tables/autoRole.js"

export enum Emotes {
  Loading = "865282736041361468",
  CheckMark = "865281743333228604",
  Cross = "865281743560638464",
  Minus = "865281743422226443",
  Plus = "865281743648194610",
  Left = "865281743371894794",
  Right = "865281743510044723",
}

export async function sendLog(
  guild: Pick<app.Guild, "id" | "channels">,
  toSend: string | app.EmbedBuilder,
  config?: Guild,
) {
  config ??= await getGuild(guild)

  if (!config) return

  if (config.log_channel_id) {
    const logs = guild.channels.cache.get(config.log_channel_id)

    if (logs?.isTextBased())
      return typeof toSend === "string"
        ? logs.send({ content: toSend, allowedMentions: { parse: [] } })
        : logs.send({ embeds: [toSend], allowedMentions: { parse: [] } })
  }
}

const userCache = new app.ResponseCache((id: string) => {
  return users.query.where("id", id).first()
}, 60_000)

export async function getUser(user: { id: string }): Promise<User | undefined>
export async function getUser(user: { id: string }, force: true): Promise<User>
export async function getUser(user: { id: string }, force?: true) {
  const userInDb = await userCache.get(user.id)

  if (force && !userInDb) {
    await users.query
      .insert({
        id: user.id,
        is_bot:
          app.ClientSingleton.get().users.cache.get(user.id)?.bot ?? false,
      })
      .onConflict("id")
      .merge()

    return userCache.set(
      [user.id],
      (await users.query.where("id", user.id).first())!,
    )
  }

  return userInDb
}

const guildCache = new app.ResponseCache((id: string) => {
  return guilds.query.where("id", id).first()
}, 60_000)

export async function getGuild(guild: {
  id: string
}): Promise<Guild | undefined>
export async function getGuild(
  guild: { id: string },
  force: true,
): Promise<Guild>
export async function getGuild(
  guild: { id: string },
  force?: true,
): Promise<Guild | undefined> {
  const config = await guildCache.get(guild.id)

  if (force && !config) {
    await guilds.query.insert({ id: guild.id })

    return guildCache.set(
      [guild.id],
      (await guilds.query.where("id", guild.id).first())!,
    )
  }

  return config
}

export async function sendTemplatedEmbed(
  channel: app.Channel,
  template: string,
  replacers: { [k: string]: string },
) {
  if (!channel.isTextBased()) return

  for (const k in replacers)
    template = template.replace(new RegExp(`{${k}}`, "g"), replacers[k])

  let embeds
  try {
    const data: app.EmbedData | app.EmbedData[] = JSON.parse(template)

    embeds = (Array.isArray(data) ? data : [data]).map((options) => {
      const embed = new app.EmbedBuilder(options)

      if (options.thumbnail?.url) embed.setThumbnail(options.thumbnail.url)
      if (options.image?.url) embed.setImage(options.image.url)

      return embed
    })

    for (const embed of embeds) await channel.send({ embeds: [embed] })
  } catch (error: any) {
    if (error.message.includes("Invalid Form Body")) {
      return channel.send(
        app.code.stringify({
          lang: "js",
          content: error.message,
        }) +
          " " +
          app.code.stringify({
            lang: "json",
            content: template,
          }),
      )
    }
    return channel.send(template)
  }
}

export function embedReplacers(
  subject: app.GuildMember | app.PartialGuildMember,
) {
  return {
    user: subject.user.toString(),
    username: subject.user.username.replace(/"/g, '\\"'),
    guild_icon:
      subject.guild.iconURL() ??
      "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
    displayName: subject.displayName.replace(/"/g, '\\"'),
    user_avatar: subject.user.displayAvatarURL(),
  }
}

export function emote(
  { client }: { client: app.Client },
  name: keyof typeof Emotes,
) {
  return client.emojis.resolve(Emotes[name])
}

export async function getAutoRoles(member: app.GuildMember): Promise<string[]> {
  const guild = await getGuild(member.guild, true)

  return (
    await autoRole.query
      .where("guild_id", guild._id)
      .and.where("bot", Number(member.user.bot))
  ).map((ar) => ar.role_id)
}

export async function applyAutoRoles(member: app.GuildMember) {
  const autoRoles = await getAutoRoles(member)

  if (member.roles.cache.hasAll(...autoRoles) || autoRoles.length === 0) return

  await member.roles.add(autoRoles).catch()
}

/**
 * @param message
 * @param index
 * @param total
 * @param pattern - use $% for percentage, $# for index, $$ for total
 * @param interval
 */
export async function sendProgress(
  message: app.Message,
  index: number,
  total: number,
  pattern: string,
  interval = 10,
) {
  if (index % interval === 0) {
    await message.edit(
      `${emote(message, "Loading")} ${pattern
        .replace("$%", String(Math.round((index * 100) / total)))
        .replace("$#", String(index))
        .replace("$$", String(total))}`,
    )
  }
}

export function isJSON(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch (error) {
    return false
  }
}

export async function countOf(builder: any, column = "*"): Promise<number> {
  return builder.count({ total: column }).then((rows: any) => {
    return rows[0]?.total ?? (0 as number)
  })
}

export async function prefix(guild?: app.Guild | null): Promise<string> {
  let prefix = process.env.BOT_PREFIX as string

  if (guild) {
    const guildData = await guilds.query
      .where("id", guild.id)
      .select("prefix")
      .first()
    if (guildData) {
      return guildData.prefix ?? prefix
    }
  }

  return prefix
}

export function shortNumber(number: number): string {
  if (number < 1000) return number.toString()
  if (number < 1000000) {
    number = number / 1000
    if (number < 100) return `${number.toFixed(1)}k`
    else return `${number.toFixed(0)}k`
  } else {
    number = number / 1000000
    if (number < 100) return `${number.toFixed(1)}M`
    else return `${number.toFixed(0)}M`
  }
}
