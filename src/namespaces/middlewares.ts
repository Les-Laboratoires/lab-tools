import * as command from "../app/command.ts"
import * as logger from "../app/logger.ts"
import * as tools from "../namespaces/tools.ts"

import { Guild } from "#tables/guild.ts"
import labs from "#tables/lab.ts"

export const staffOnly = new command.Middleware<"guild">(
  "Staff only",
  async function staffOnly(message, data) {
    const config = await tools.getGuild(message.guild)

    if (!config?.staff_role_id)
      logger.warn(`Staff role is not configured in ${message.guild.name}`)

    return {
      result:
        (config?.staff_role_id &&
          message.member.roles.cache.has(config.staff_role_id)) ||
        message.guild.ownerId === message.author.id ||
        message.member.permissions.has("Administrator") ||
        "You must be a member of staff.",
      data,
    }
  },
)

export const hasConfigKey = (key: keyof Guild) =>
  new command.Middleware<"guild">(`Has ${key} key`, async function hasConfigKey(
    message,
    data,
  ) {
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
  })

export const isNotInUse = (
  inUse: () => boolean,
): command.Middleware<"all" | "guild" | "dm"> =>
  new command.Middleware("Is not in use", async function isNotInUse(_, data) {
    return {
      result: !inUse() || "Command is already in use.",
      data,
    }
  })

export const labOnly = new command.Middleware<"guild">(
  "Lab only",
  async function labOnly(message, data) {
    const config = await tools.getGuild(message.guild)

    if (!config)
      return {
        result: "This command can only be used in a lab.",
        data,
      }

    const lab = await labs.query
      .where("guild_id", config._id)
      .andWhere("ignored", false)
      .first()

    return {
      result: !!lab || "This command can only be used in a lab.",
      data,
    }
  },
)
