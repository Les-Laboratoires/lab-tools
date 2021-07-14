import * as command from "../app/command"
import * as logger from "../app/logger"
import * as utils from "../namespaces/utils"

import { GuildConfig } from "../tables/guilds"

export function staffOnly(): command.Middleware<"guild"> {
  return async (message, data) => {
    const config = await utils.getConfig(message.guild)

    if (!config?.staff_role_id)
      logger.warn(
        `Staff role is not configured in ${message.guild.name}`,
        "system"
      )

    return {
      result:
        (config?.staff_role_id &&
          message.member.roles.cache.has(config.staff_role_id)) ||
        message.guild.ownerID === message.author.id ||
        message.member.permissions.has("ADMINISTRATOR") ||
        "You must be a member of staff.",
      data,
    }
  }
}

export function hasConfigKey(
  key: keyof GuildConfig
): command.Middleware<"guild"> {
  return async (message, data) => {
    const config = await utils.getConfig(message.guild)

    if (!config?.[key])
      return {
        result: `You need to setup the **${key}** property !\nUse the \`${message.usedPrefix}config set ${key} <value>\` comand`,
        data,
      }

    return {
      result: true,
      data,
    }
  }
}
