import Discord from "discord.js"

import * as app from "../app"

import guilds, { GuildConfig } from "../tables/guilds"
import autoRole from "../tables/autoRole"
import users from "../tables/users"

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
  presentation = "*Pas de présentation*",
  config?: GuildConfig
) {
  await users.query
    .insert({
      id: member.id,
      presentation,
    })
    .onConflict("id")
    .merge()

  config ??= await getConfig(member.guild)

  if (!config) return

  if (config.member_default_role_id)
    await member.roles.add(config.member_default_role_id).catch(app.error)

  if (config.validation_role_id)
    await member.roles.remove(config.validation_role_id).catch(app.error)

  await applyAutoRoles(member)

  if (config.general_channel_id && config.member_welcome_message) {
    const general = await member.client.channels.cache.get(
      config.general_channel_id
    )

    if (general) {
      await embedTemplate(general, config.member_welcome_message, {
        ...embedReplacers(member),
        presentation: presentation.replace(/\n/g, "\\n").replace(/"/g, '\\"'),
      })
    }
  }
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

    if (logs?.isText()) return logs.send(toSend)
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

export async function embedTemplate(
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

    for (const embed of embeds) await channel.send(embed)
  } catch (error) {
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

export async function applyAutoRoles(member: app.GuildMember) {
  const autoRoles = await autoRole.query
    .where("guild_id", member.guild.id)
    .and.where("bot", Number(member.user.bot))

  await member.roles.add(autoRoles.map((ar) => ar.role_id)).catch(app.error)
}
