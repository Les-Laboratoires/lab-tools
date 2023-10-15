import Discord from "discord.js"

import * as app from "../app.js"

import users, { User } from "../tables/user.js"
import guilds, { Guild } from "../tables/guild.js"
import autoRole from "../tables/autoRole.js"

import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

export enum Emotes {
  APPROVED = "865281743333228604",
  DISAPPROVED = "865281743560638464",
  CHECK = "865281743333228604",
  MINUS = "865281743422226443",
  DENY = "865281743560638464",
  PLUS = "865281743648194610",
  RIGHT = "865281743510044723",
  LEFT = "865281743371894794",
  WAIT = "865282736041361468",
}

export async function sendLog(
  guild: app.Guild,
  toSend: string | app.MessageEmbed,
  config?: Guild
) {
  config ??= await getGuild(guild)

  if (!config) return

  if (config.log_channel_id) {
    const logs = guild.channels.cache.get(config.log_channel_id)

    if (logs?.isText())
      return typeof toSend === "string"
        ? logs.send({ content: toSend, allowedMentions: { parse: [] } })
        : logs.send({ embeds: [toSend], allowedMentions: { parse: [] } })
  }
}

export async function createUser(user: { id: string }) {
  await users.query.insert({ id: user.id })
}

export async function getUser(user: { id: string }): Promise<User | undefined>
export async function getUser(user: { id: string }, force: true): Promise<User>
export async function getUser(user: { id: string }, force?: true) {
  const userInDb = await users.query.where("id", user.id).first()

  if (force && !userInDb) {
    await createUser(user)
    return (await users.query.where("id", user.id).first())!
  }

  return userInDb
}

export async function getGuild(guild: {
  id: string
}): Promise<Guild | undefined>
export async function getGuild(
  guild: { id: string },
  force: true
): Promise<Guild>
export async function getGuild(
  guild: { id: string },
  force?: true
): Promise<Guild | undefined> {
  const config = await guilds.query.where("id", guild.id).first()

  if (force && !config) {
    await guilds.query.insert({ id: guild.id })
    return (await guilds.query.where("id", guild.id).first())!
  }

  return config
}

export async function sendTemplatedEmbed(
  channel: app.AnyChannel,
  template: string,
  replacers: { [k: string]: string }
) {
  if (!channel.isText()) return

  for (const k in replacers)
    template = template.replace(new RegExp(`{${k}}`, "g"), replacers[k])

  let embeds
  try {
    const data: app.MessageEmbedOptions | app.MessageEmbedOptions[] =
      JSON.parse(template)

    embeds = (Array.isArray(data) ? data : [data]).map((options) => {
      const embed = new app.MessageEmbed(options)

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
          })
      )
    }
    return channel.send(template)
  }
}

export function embedReplacers(subject: app.GuildMember) {
  return {
    user: subject.user.toString(),
    username: subject.user.username.replace(/"/g, '\\"'),
    user_tag: subject.user.tag.replace(/"/g, '\\"'),
    guild_icon:
      subject.guild.iconURL({ dynamic: true }) ??
      "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
    displayName: subject.displayName.replace(/"/g, '\\"'),
    user_avatar: subject.user.displayAvatarURL({ dynamic: true }),
  }
}

export function emote(
  { client }: { client: app.Client },
  name: keyof typeof Emotes
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

  if (member.roles.cache.hasAll(...autoRoles)) return

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
  interval = 10
) {
  if (index % interval === 0) {
    await message.edit(
      `${emote(message, "WAIT")} ${pattern
        .replace("$%", String(Math.round((index * 100) / total)))
        .replace("$#", String(index))
        .replace("$$", String(total))}`
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

export function countOf(builder: any): Promise<number> {
  return builder.count({ total: "*" }).then((rows: any) => {
    return rows[0].total as number
  })
}
