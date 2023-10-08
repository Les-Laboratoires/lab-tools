import * as command from "../app/command.js"
import * as logger from "../app/logger.js"
import * as tools from "../namespaces/tools.js"

import { Guild } from "../tables/guild.js"

export function staffOnly(): command.Middleware<"guild"> {
  return async function staffOnly(message, data) {
    const config = await tools.getGuild(message.guild)

    if (!config?.staff_role_id)
      logger.warn(
        `Staff role is not configured in ${message.guild.name}`,
        "system"
      )

    return {
      result:
        (config?.staff_role_id &&
          message.member.roles.cache.has(config.staff_role_id)) ||
        message.guild.ownerId === message.author.id ||
        message.member.permissions.has("ADMINISTRATOR") ||
        "You must be a member of staff.",
      data,
    }
  }
}

export function hasConfigKey(key: keyof Guild): command.Middleware<"guild"> {
  return async function hasConfigKey(message, data) {
    const config = await tools.getGuild(message.guild)

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

export function isNotInUse(
  inUse: () => boolean
): command.Middleware<"all" | "guild" | "dm"> {
  return async function isNotInUse(message, data) {
    return {
      result: !inUse() || "Command is already in use.",
      data,
    }
  }
}
