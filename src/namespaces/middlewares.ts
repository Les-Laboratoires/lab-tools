import * as command from "../app/command.js"
import * as logger from "../app/logger.js"
import * as utils from "../namespaces/utils.js"

import { GuildConfig } from "../tables/guilds.js"

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
        message.guild.ownerId === message.author.id ||
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

export function isInHelpRoom(): command.Middleware<"guild"> {
  return async (message, data) => {
    const config = await utils.getConfig(message.guild)

    const check = await hasConfigKey("help_room_pattern")(message, data)

    if (check.result !== true) return check

    return {
      result:
        message.channel.name.includes(config?.help_room_pattern as string) ||
        "You must be in a help room.",
      data: check.data,
    }
  }
}

export function isAlreadyUsed(
  inUse: () => boolean
): command.Middleware<"all" | "guild" | "dm"> {
  return async (message, data) => {
    return {
      result: !inUse || "Command is already in use.",
      data,
    }
  }
}
