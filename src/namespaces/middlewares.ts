import * as command from "../app/command"
import * as logger from "../app/logger"
import * as utils from "../namespaces/utils"

import { GuildConfig } from "../tables/guilds"

export function staffOnly(): command.Middleware<"guild"> {
  return async (message) => {
    const config = await utils.getConfig(message.guild)

    if (!config?.staff_role_id)
      logger.warn("Staff role is not configured!", "system")

    return (
      (config?.staff_role_id &&
        message.member.roles.cache.has(config.staff_role_id)) ||
      message.guild.ownerID === message.author.id ||
      message.member.permissions.has("ADMINISTRATOR") ||
      "You must be a member of staff."
    )
  }
}

export function hasConfigKey(
  key: keyof GuildConfig
): command.Middleware<"guild"> {
  return async (message) => {
    const config = await utils.getConfig(message.guild)

    if (!config?.[key])
      return `You need to setup the **${key}** property !\nUse the \`${message.usedPrefix}config set ${key} <value>\` comand`

    return true
  }
}
