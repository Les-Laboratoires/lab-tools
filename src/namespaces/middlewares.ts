import * as handler from "../app/handler"
import * as snowflakes from "../namespaces/snowflakes"

export function staffOnly(message: handler.GuildMessage) {
  return (
    message.member.roles.cache.has(snowflakes.Roles.STAFF) ||
    "You must be a member of staff."
  )
}
