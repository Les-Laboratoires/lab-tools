import * as command from "../app/command"
import * as snowflakes from "../namespaces/snowflakes"

export function staffOnly(message: command.GuildMessage) {
  return (
    message.member.roles.cache.has(snowflakes.Roles.STAFF) ||
    "You must be a member of staff."
  )
}
