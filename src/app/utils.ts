import dayjs from "dayjs"
import Discord from "discord.js"
import * as command from "./command"

export const ghom = "352176756922253321"
export const loockeeer = "272676235946098688"
export const validation = "659513985552351261"
export const scientifique = "620641458168397845"
export const presentations = "622383963511717928"
export const approved = "640661715108888595"
export const disapproved = "507420627821527040"
export const staff = "620657235533758494"
export const modo = "620302774638215168"
export const general = "620664805400772621"
export const cobaye = "620640927089688587"

export function code(text: string, lang = ""): string {
  return "```" + lang + "\n" + text.replace(/```/g, "\\```") + "\n```"
}

export async function resolveMember(
  message: command.CommandMessage,
  text?: string
): Promise<Discord.GuildMember> {
  if (message.mentions.members && message.mentions.members.size > 0) {
    return message.mentions.members.first() as Discord.GuildMember
  }

  text = text || message.content

  if (text.length < 3) return message.member

  if (/^\d+$/.test(text)) {
    return message.guild.members.fetch(text)
  }

  text = text.toLowerCase()

  const members = await message.guild.members.fetch({ query: text })

  if (members.size > 0) return members.first() as Discord.GuildMember

  return message.member
}

export function isModo(member: Discord.GuildMember) {
  return (
    member.permissions.has("ADMINISTRATOR", true) ||
    member.roles.cache.has(module.exports.modo)
  )
}

dayjs.locale("fr")

export { dayjs }
