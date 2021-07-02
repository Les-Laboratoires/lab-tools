import Discord from "discord.js"

import * as app from "../app"

import guilds, { GuildConfig } from "../tables/guilds"
import autoRole from "../tables/autoRole"

/*
[
  {
    "author": {
      "name": "{displayName} vient de se présenter !",
      "icon_url": "{guild_icon}"
    },
    "description": "{presentation}",
    "thumbnail": "{user_avatar}"
  },
  {
    "title": "Bienvenue sur Les Laboratoires JS !",
    "description": "Gêrer tes rôles : <#622848426484432952>\nL'entraide : <#622382324880900096> <#622382349426098200> (etc...)\nNotre réseau : <#620661794410856451> <#713850539368251533>\nUtiliser des commandes : <#620663106250604546> <#620663121622859776> (etc...)\nQuestions rapides : <#622382556192571416>\nApprendre le JS : <#622381685820096512>\nTips JS : <#627239007440338954>\n\nNous te souhaitons un excellent séjour parmi nous ! <:pepeYay:557124850326437888>"
  }
]
*/

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
  config ??= await getConfig(member.guild)

  if (!config) return

  if (config.member_default_role) {
    await member.roles.add(config.member_default_role)
  }

  if (config.validation_role) {
    await member.roles.remove(config.validation_role)
  }

  const autoRoles = await autoRole.query.where("guild_id", member.guild.id)

  for (const roleData of autoRoles) {
    await member.roles.add(roleData.role_id).catch()
  }

  if (config.general_channel_id && config.member_welcome_message) {
    const general = await member.client.channels.cache.get(
      config.general_channel_id
    )

    if (general?.isText()) {
      const guildIcon = member.guild.iconURL({ dynamic: true })

      let message = config.member_welcome_message
        .replace(/{username}/g, member.user.username)
        .replace(/{user_tag}/g, member.user.tag)
        .replace(/{displayName}/g, member.displayName)
        .replace(/{presentation}/g, presentation)
        .replace(
          /{user_avatar}/g,
          member.user.displayAvatarURL({ dynamic: true })
        )

      if (guildIcon) message = message.replace(/{guild_icon}/g, guildIcon)

      let json
      try {
        json = JSON.parse(message)
      } catch (error) {}

      if (json) {
        let embeds = (Array.isArray(json) ? json : [json]).map(
          (json) => new app.MessageEmbed(json)
        )

        for (const embed of embeds) await general.send(embed)
      } else {
        return general.send(message)
      }
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
): Promise<GuildConfig | undefined> {
  return guilds.query.where("id", guild.id).first()
}
