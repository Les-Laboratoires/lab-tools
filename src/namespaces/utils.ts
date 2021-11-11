import Discord from "discord.js"

import * as app from "../app.js"

import guilds, { GuildConfig } from "../tables/guilds.js"
import restart, { Restart } from "../tables/restart.js"
import autoRole from "../tables/autoRole.js"
import users from "../tables/users.js"

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

export async function prefix(guild?: Discord.Guild): Promise<string> {
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

export async function approveMember(
  member: app.GuildMember,
  presentation?: app.Message,
  config?: GuildConfig
) {
  await users.query
    .insert({
      id: member.id,
      presentation_id: presentation?.id,
      presentation_guild_id: presentation?.guild?.id,
    })
    .onConflict("id")
    .merge()

  if (!config) config = await getConfig(member.guild, true)

  await member.fetch(true)

  const roles = await getAutoRoles(member)

  if (config.member_role_id) roles.push(config.member_role_id)

  await member.roles.set([
    ...roles,
    ...member.roles.cache
      .filter((role) => role.id !== config?.await_validation_role_id)
      .values(),
  ])

  if (config.general_channel_id && config.member_welcome_message) {
    const general = await member.client.channels.cache.get(
      config.general_channel_id
    )

    if (general) {
      await sendTemplatedEmbed(general, config.member_welcome_message, {
        ...embedReplacers(member),
        presentation: (
          presentation?.content ?? "*This member does not have a presentation.*"
        )
          .replace(/\n/g, "\\n")
          .replace(/"/g, '\\"'),
      })
    }
  }
}

export async function disapproveMember(
  member: app.GuildMember,
  presentation: app.Message,
  config?: GuildConfig
) {
  await users.query.delete().where({ id: member.id })

  if (!config) config = await getConfig(member.guild, true)

  if (config.log_channel_id && config.member_welcome_message) {
    const logChannel = member.client.channels.cache.get(config.log_channel_id)

    if (logChannel?.isText())
      await sendTemplatedEmbed(
        logChannel,
        "**Presentation**:\n{presentation}",
        {
          ...embedReplacers(member),
          presentation: presentation.content
            .replace(/\n/g, "\\n")
            .replace(/"/g, '\\"'),
        }
      )
  }

  await member.kick()
  await presentation.delete().catch()
}

export async function sendLog(
  guild: app.Guild,
  toSend: string | app.MessageEmbed,
  config?: GuildConfig
) {
  config ??= await getConfig(guild)

  if (!config) return

  if (config.log_channel_id) {
    const logs = guild.channels.cache.get(config.log_channel_id)

    if (logs?.isText())
      return typeof toSend === "string"
        ? logs.send(toSend)
        : logs.send({ embeds: [toSend] })
  }
}

export async function getConfig(
  guild: app.Guild
): Promise<GuildConfig | undefined>
export async function getConfig(
  guild: app.Guild,
  force: true
): Promise<GuildConfig>
export async function getConfig(
  guild: app.Guild,
  force?: true
): Promise<GuildConfig | undefined> {
  const config = await guilds.query.where("id", guild.id).first()

  if (force && !config) {
    await guilds.query.insert({ id: guild.id })
    return (await guilds.query.where("id", guild.id).first()) as GuildConfig
  }

  return config
}

export async function sendTemplatedEmbed(
  channel: app.Channel,
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
  name: keyof typeof app.Emotes
) {
  return client.emojis.resolve(Emotes[name])
}

export async function getAutoRoles(member: app.GuildMember): Promise<string[]> {
  return (
    await autoRole.query
      .where("guild_id", member.guild.id)
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
 * @param pattern - use $% symbol for includes percent number
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
      `${app.emote(message, "WAIT")} ${pattern.replace(
        "$%",
        String(Math.round((index * 100) / total))
      )}`
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
