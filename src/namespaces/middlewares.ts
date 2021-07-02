import * as command from "../app/command"
import * as utils from "../namespaces/utils"

import { GuildConfig } from "../tables/guilds"

export function staffOnly(config?: GuildConfig): command.Middleware<"guild"> {
  return async (message) => {
    config ??= await utils.getConfig(message.guild)

    if (!config?.staff_role_id) return "Staff role is not configured!"

    return (
      message.member.roles.cache.has(config.staff_role_id) ||
      "You must be a member of staff."
    )
  }
}
