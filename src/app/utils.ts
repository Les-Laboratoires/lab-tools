import dayjs from "dayjs"
import Discord from "discord.js"
import * as command from "./command"

export const labs = "507389389098188820"
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

export const currency = "Ɠ"

export const codeRegex = /^```(?:js)?\s(.+[^\\])```$/is

export function code(text: string, lang = ""): string {
  return "```" + lang + "\n" + text.replace(/```/g, "\\```") + "\n```"
}

export function getArgument(message: Discord.Message): string | null
export function getArgument(
  message: Discord.Message,
  match: "number"
): number | null
export function getArgument(
  message: Discord.Message,
  match: "rest" | "word" | RegExp | string[]
): string | null
export function getArgument(
  message: Discord.Message,
  match: "rest" | "word" | "number" | RegExp | string[] = "word"
): string | number | null {
  if (match === "word") {
    const key = message.content.split(/\s+/)[0]
    message.content = message.content.replace(key, "").trim()
    return key
  } else if (match === "rest") {
    const key = message.content
    message.content = ""
    return key
  } else if (match === "number") {
    const regex = /^-?[1-9]\d*/
    const result = regex.exec(message.content)
    if (result) {
      message.content.replace(regex, "").trim()
      return Number(result[0])
    }
  } else if (Array.isArray(match)) {
    for (const key of match) {
      if (message.content.startsWith(key)) {
        message.content = message.content.slice(key.length).trim()
        return key
      }
    }
  } else {
    const result = match.exec(message.content)
    if (result) {
      const key = result[1] ?? result[0]
      match.lastIndex = 0
      message.content.replace(match, "").trim()
      return key
    }
  }
  return null
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
    
export function leaderItem(obj: { score: number; id: string }, i: number) {
  const position = String(i + 1)
  return `\`# ${position}${position.length === 1 ? " " : ""} | ${
    obj.score
  } pts\` - <@${obj.id}>`
}

dayjs.locale("fr")

export { dayjs }
