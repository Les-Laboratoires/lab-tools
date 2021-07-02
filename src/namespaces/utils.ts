import Discord from "discord.js"

import * as app from "../app"

import guilds from "../tables/guilds"

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
  presentation = "*Pas de présentation*"
) {
  await member.roles.add(app.Roles.MEMBER)
  await member.roles.add(app.Roles.EVENT_NOTIFICATION)
  await member.roles.add(app.Roles.SURVEY_NOTIFICATION)
  await member.roles.add(app.Roles.ANNOUNCE_NOTIFICATION)
  await member.roles.add(app.Roles.HELP_ACCESS)
  await member.roles.add(app.Roles.LABS_ACCESS)
  await member.roles.add(app.Roles.SHARE_ACCESS)
  await member.roles.remove(app.Roles.VALIDATION)

  const general = await member.client.channels.cache.get(app.Channels.GENERAL)

  if (general?.isText()) {
    await general.send(
      new app.MessageEmbed()
        .setAuthor(
          `${member.displayName} vient de se présenter !`,
          member.guild.iconURL({
            dynamic: true,
            size: 64,
          }) ?? undefined
        )
        .setDescription(presentation)
        .setThumbnail(
          member.user.displayAvatarURL({
            dynamic: true,
          })
        )
    )

    return general.send(
      new app.MessageEmbed()
        .setTitle("Bienvenue sur Les Laboratoires JS !")
        .setDescription(
          [
            `Gêrer tes rôles : <#622848426484432952>`,
            `L'entraide : <#622382324880900096> <#622382349426098200> (etc...)`,
            `Notre réseau : <#620661794410856451> <#713850539368251533>`,
            `Utiliser des commandes : <#620663106250604546> <#620663121622859776> (etc...)`,
            `Questions rapides : <#622382556192571416>`,
            `Apprendre le JS : <#622381685820096512>`,
            `Tips JS : <#627239007440338954>`,
            "",
            `Nous te souhaitons un excellent séjour parmi nous ! <:pepeYay:557124850326437888>`,
          ].join("\n")
        )
    )
  }
}
