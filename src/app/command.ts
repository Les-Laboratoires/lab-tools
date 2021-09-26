import discord from "discord.js"
import API from "discord-api-types/v8"
import chalk from "chalk"
import tims from "tims"
import path from "path"
import yargsParser from "yargs-parser"

import * as core from "./core.js"
import * as logger from "./logger.js"
import * as handler from "./handler.js"
import * as argument from "./argument.js"

export const commandHandler = new handler.Handler(
  process.env.BOT_COMMANDS_PATH ?? path.join(process.cwd(), "dist", "commands")
)

commandHandler.on("load", async (filepath) => {
  const file = await import("file://" + filepath)
  return commands.add(file.default)
})

export let defaultCommand: Command<any> | null = null

export const commands = new (class CommandCollection extends discord.Collection<
  string,
  Command<keyof CommandMessageType>
> {
  public resolve(key: string): Command<keyof CommandMessageType> | undefined {
    for (const [name, command] of this) {
      if (
        key === name ||
        command.options.aliases?.some((alias) => key === alias)
      )
        return command
    }
  }

  public add(command: Command<keyof CommandMessageType>) {
    validateCommand(command)
    this.set(command.options.name, command)
  }
})()

export type SentItem = string | discord.MessagePayload | discord.MessageOptions

export type NormalMessage = discord.Message & {
  args: { [name: string]: any } & any[]
  triggerCoolDown: () => void
  send: (this: NormalMessage, item: SentItem) => Promise<discord.Message>
  sendTimeout: (
    this: NormalMessage,
    timeout: number,
    item: SentItem
  ) => Promise<discord.Message>
  usedAsDefault: boolean
  isFromBotOwner: boolean
  isFromGuildOwner: boolean
  usedPrefix: string
  client: core.FullClient
  rest: string
}

export type GuildMessage = NormalMessage & {
  channel: discord.TextChannel & discord.GuildChannel
  guild: discord.Guild
  member: discord.GuildMember
}

export type DirectMessage = NormalMessage & {
  channel: discord.DMChannel
}

export interface CoolDown {
  time: number
  trigger: boolean
}

export interface MiddlewareResult {
  result: boolean | string
  data: any
}

export type Middleware<Type extends keyof CommandMessageType> = (
  message: CommandMessageType[Type],
  data: any
) => Promise<MiddlewareResult> | MiddlewareResult

export interface CommandMessageType {
  guild: GuildMessage
  dm: DirectMessage
  all: NormalMessage
}

export interface CommandOptions<Type extends keyof CommandMessageType> {
  channelType?: Type

  name: string
  /**
   * Short description displayed in help menu
   */
  description: string
  /**
   * Description displayed in command detail
   */
  longDescription?: core.Scrap<string, [message: CommandMessageType[Type]]>
  /**
   * Use this command if prefix is given but without command matching
   */
  isDefault?: boolean
  /**
   * Use this command as slash command
   */
  isSlash?: boolean
  aliases?: string[]
  /**
   * Cool down of command (in ms)
   */
  coolDown?: core.Scrap<number, [message: CommandMessageType[Type]]>
  examples?: core.Scrap<string[], [message: CommandMessageType[Type]]>

  // Restriction flags and permissions
  guildOwnerOnly?: core.Scrap<boolean, [message: CommandMessageType[Type]]>
  botOwnerOnly?: core.Scrap<boolean, [message: CommandMessageType[Type]]>
  userPermissions?: core.Scrap<
    discord.PermissionString[],
    [message: CommandMessageType[Type]]
  >
  botPermissions?: core.Scrap<
    discord.PermissionString[],
    [message: CommandMessageType[Type]]
  >

  roles?: core.Scrap<
    (
      | discord.RoleResolvable
      | discord.RoleResolvable[]
      | [discord.RoleResolvable]
      | [discord.RoleResolvable[]]
    )[],
    [message: CommandMessageType[Type]]
  >

  /**
   * Middlewares can stop the command if returning a string (string is displayed as error message in discord)
   */
  middlewares?: Middleware<Type>[]

  /**
   * The rest of message after excludes all other arguments.
   */
  rest?: argument.Rest<CommandMessageType[Type]>
  /**
   * Yargs positional argument (e.g. `[arg] <arg>`)
   */
  positional?: argument.Positional<CommandMessageType[Type]>[]
  /**
   * Yargs option arguments (e.g. `--myArgument=value`)
   */
  options?: argument.Option<CommandMessageType[Type]>[]
  /**
   * Yargs flag arguments (e.g. `--myFlag -f`)
   */
  flags?: argument.Flag<CommandMessageType[Type]>[]
  run: (this: Command<Type>, message: CommandMessageType[Type]) => unknown
  /**
   * Sub-commands
   */
  subs?: (Command<"guild"> | Command<"dm"> | Command<"all">)[]
  /**
   * This slash command options are automatically setup on bot running but you can configure it manually too.
   */
  slash?: API.RESTPostAPIApplicationCommandsJSONBody
  /**
   * This property is automatically setup on bot running.
   * @deprecated
   */
  parent?: Command<keyof CommandMessageType>
}

export class Command<Type extends keyof CommandMessageType = "all"> {
  constructor(public options: CommandOptions<Type>) {}
}

export function validateCommand<
  Type extends keyof CommandMessageType = keyof CommandMessageType
>(
  command: Command<Type>,
  parent?: Command<keyof CommandMessageType>
): void | never {
  command.options.parent = parent

  if (command.options.isDefault) {
    if (defaultCommand)
      logger.error(
        `the ${chalk.blueBright(
          command.options.name
        )} command wants to be a default command but the ${chalk.blueBright(
          defaultCommand.options.name
        )} command is already the default command`,
        "command:validateCommand"
      )
    else defaultCommand = command
  }

  const help: argument.Flag<CommandMessageType[Type]> = {
    name: "help",
    flag: "h",
    description: "Get help from the command",
  }

  if (!command.options.flags) command.options.flags = [help]
  else command.options.flags.push(help)

  for (const flag of command.options.flags)
    if (flag.flag)
      if (flag.flag.length !== 1)
        throw new Error(
          `The "${flag.name}" flag length of "${
            path ? path + " " + command.options.name : command.options.name
          }" command must be equal to 1`
        )

  if (command.options.coolDown)
    if (!command.options.run.toString().includes("triggerCoolDown"))
      logger.warn(
        `you forgot using ${chalk.greenBright(
          "message.triggerCoolDown()"
        )} in the ${chalk.blueBright(command.options.name)} command.`,
        "command:validateCommand"
      )

  logger.log(
    `loaded command ${chalk.blueBright(
      commandBreadcrumb(command)
    )} ${chalk.grey(command.options.description)}`
  )

  if (command.options.subs)
    for (const sub of command.options.subs)
      validateCommand(sub as any, command as Command<any>)
}

export function commandBreadcrumb<Type extends keyof CommandMessageType>(
  command: Command<Type>,
  separator = " "
): string {
  return commandParents(command)
    .map((cmd) => cmd.options.name)
    .reverse()
    .join(separator)
}

export function commandParents<Type extends keyof CommandMessageType>(
  command: Command<Type>
): Command<any>[] {
  return command.options.parent
    ? [command, ...commandParents(command.options.parent)]
    : [command]
}

export async function prepareCommand<Type extends keyof CommandMessageType>(
  message: CommandMessageType[Type],
  cmd: Command<Type>,
  context?: {
    restPositional: string[]
    baseContent: string
    parsedArgs: yargsParser.Arguments
    key: string
  }
): Promise<discord.MessageEmbed | boolean> {
  // coolDown
  if (cmd.options.coolDown) {
    const slug = core.slug("coolDown", cmd.options.name, message.channel.id)
    const coolDown = core.cache.ensure<CoolDown>(slug, {
      time: 0,
      trigger: false,
    })

    message.triggerCoolDown = () => {
      core.cache.set(slug, {
        time: Date.now(),
        trigger: true,
      })
    }

    if (coolDown.trigger) {
      const coolDownTime = await core.scrap(cmd.options.coolDown, message)

      if (Date.now() > coolDown.time + coolDownTime) {
        core.cache.set(slug, {
          time: 0,
          trigger: false,
        })
      } else {
        return new discord.MessageEmbed()
          .setColor("RED")
          .setAuthor(
            `Please wait ${Math.ceil(
              (coolDown.time + coolDownTime - Date.now()) / 1000
            )} seconds...`,
            message.client.user.displayAvatarURL()
          )
      }
    }
  } else {
    message.triggerCoolDown = () => {
      logger.warn(
        `You must setup the cooldown of the "${cmd.options.name}" command before using the "triggerCoolDown" method`,
        "command:prepareCommand"
      )
    }
  }

  const channelType = await core.scrap(cmd.options.channelType, message)

  if (isGuildMessage(message)) {
    if (channelType === "dm")
      return new discord.MessageEmbed()
        .setColor("RED")
        .setAuthor(
          "This command must be used in DM.",
          message.client.user.displayAvatarURL()
        )

    if (core.scrap(cmd.options.guildOwnerOnly, message))
      if (
        message.guild.ownerId !== message.member.id &&
        process.env.BOT_OWNER !== message.member.id
      )
        return new discord.MessageEmbed()
          .setColor("RED")
          .setAuthor(
            "You must be the guild owner.",
            message.client.user.displayAvatarURL()
          )

    if (cmd.options.botPermissions) {
      const botPermissions = await core.scrap(
        cmd.options.botPermissions,
        message
      )

      for (const permission of botPermissions)
        if (!message.guild.me?.permissions.has(permission, true))
          return new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor("Oops!", message.client.user.displayAvatarURL())
            .setDescription(
              `I need the \`${permission}\` permission to call this command.`
            )
    }

    if (cmd.options.userPermissions) {
      const userPermissions = await core.scrap(
        cmd.options.userPermissions,
        message
      )

      for (const permission of userPermissions)
        if (!message.member.permissions.has(permission, true))
          return new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor("Oops!", message.client.user.displayAvatarURL())
            .setDescription(
              `You need the \`${permission}\` permission to call this command.`
            )
    }

    if (cmd.options.roles) {
      const roles = await core.scrap(cmd.options.roles, message)

      const isRole = (r: any): r is discord.RoleResolvable => {
        return typeof r === "string" || r instanceof discord.Role
      }

      const getRoleId = (r: discord.RoleResolvable): string => {
        return typeof r === "string" ? r : r.id
      }

      const member = await message.member.fetch()

      for (const roleCond of roles) {
        if (isRole(roleCond)) {
          const id = getRoleId(roleCond)

          if (!member.roles.cache.has(id)) {
            return new discord.MessageEmbed()
              .setColor("RED")
              .setAuthor("Oops!", message.client.user.displayAvatarURL())
              .setDescription(
                `You must have the <@${id}> role to call this command.`
              )
          }
        } else {
          if (roleCond.length === 1) {
            const _roleCond = roleCond[0]
            if (isRole(_roleCond)) {
              const id = getRoleId(_roleCond)

              if (member.roles.cache.has(id)) {
                return new discord.MessageEmbed()
                  .setColor("RED")
                  .setAuthor("Oops!", message.client.user.displayAvatarURL())
                  .setDescription(
                    `You mustn't have the <@${id}> role to call this command.`
                  )
              }
            } else {
              for (const role of _roleCond) {
                if (member.roles.cache.has(getRoleId(role))) {
                  return new discord.MessageEmbed()
                    .setColor("RED")
                    .setAuthor("Oops!", message.client.user.displayAvatarURL())
                    .setDescription(
                      `You mustn't have the <@${getRoleId(
                        role
                      )}> role to call this command.`
                    )
                }
              }
            }
          } else {
            let someRoleGiven = false

            for (const role of roleCond) {
              if (Array.isArray(role)) {
                logger.warn(
                  `Bad command.roles structure in ${chalk.bold(
                    commandBreadcrumb(cmd, "/")
                  )} command.`,
                  "command:prepareCommand"
                )
              } else {
                const id = getRoleId(role)

                if (member.roles.cache.has(id)) {
                  someRoleGiven = true
                  break
                }
              }
            }

            if (!someRoleGiven)
              return new discord.MessageEmbed()
                .setColor("RED")
                .setAuthor("Oops!", message.client.user.displayAvatarURL())
                .setDescription(
                  `You must have at least one of the following roles to call this command.\n${[
                    ...roleCond,
                  ]
                    .filter(
                      (role): role is discord.RoleResolvable =>
                        !Array.isArray(role)
                    )
                    .map((role) => `<@${getRoleId(role)}>`)
                    .join(" ")}`
                )
          }
        }
      }
    }
  }

  if (channelType === "guild")
    if (isDirectMessage(message))
      return new discord.MessageEmbed()
        .setColor("RED")
        .setAuthor(
          "This command must be used in a guild.",
          message.client.user.displayAvatarURL()
        )

  if (await core.scrap(cmd.options.botOwnerOnly, message))
    if (process.env.BOT_OWNER !== message.author.id)
      return new discord.MessageEmbed()
        .setColor("RED")
        .setAuthor(
          "You must be my owner.",
          message.client.user.displayAvatarURL()
        )

  if (context) {
    if (cmd.options.positional) {
      const positionalList = await core.scrap(cmd.options.positional, message)

      for (const positional of positionalList) {
        const index = positionalList.indexOf(positional)
        let value: any = context.parsedArgs._[index]
        const given = value !== undefined && value !== null

        const set = (v: any) => {
          message.args[positional.name] = v
          message.args[index] = v
          value = v
        }

        if (value) value = argument.trimArgumentValue(value)

        set(value)

        if (!given) {
          if (await core.scrap(positional.required, message)) {
            if (positional.missingErrorMessage) {
              if (typeof positional.missingErrorMessage === "string") {
                return new discord.MessageEmbed()
                  .setColor("RED")
                  .setAuthor(
                    `Missing positional "${positional.name}"`,
                    message.client.user.displayAvatarURL()
                  )
                  .setDescription(positional.missingErrorMessage)
              } else {
                return positional.missingErrorMessage
              }
            }

            return new discord.MessageEmbed()
              .setColor("RED")
              .setAuthor(
                `Missing positional "${positional.name}"`,
                message.client.user.displayAvatarURL()
              )
              .setDescription(
                positional.description
                  ? "Description: " + positional.description
                  : `Run the following command to learn more: ${core.code.stringify(
                      {
                        content: `${message.usedPrefix}${context.key} --help`,
                      }
                    )}`
              )
          } else if (positional.default !== undefined) {
            set(await core.scrap(positional.default, message))
          } else {
            set(null)
          }
        } else if (positional.checkValue) {
          const checked = await argument.checkValue(
            positional,
            "positional",
            value,
            message
          )

          if (checked !== true) return checked
        }

        if (value !== null && positional.castValue) {
          const casted = await argument.castValue(
            positional,
            "positional",
            value,
            message,
            set
          )

          if (casted !== true) return casted
        }

        if (value !== null && positional.checkCastedValue) {
          const checked = await argument.checkCastedValue(
            positional,
            "positional",
            value,
            message
          )

          if (checked !== true) return checked
        }

        context.restPositional.shift()
      }
    }

    if (cmd.options.options) {
      const options = await core.scrap(cmd.options.options, message)

      for (const option of options) {
        let { given, value } = argument.resolveGivenArgument(
          context.parsedArgs,
          option
        )

        const set = (v: any) => {
          message.args[option.name] = v
          value = v
        }

        if (value === true) value = undefined

        if (!given && (await core.scrap(option.required, message))) {
          if (option.missingErrorMessage) {
            if (typeof option.missingErrorMessage === "string") {
              return new discord.MessageEmbed()
                .setColor("RED")
                .setAuthor(
                  `Missing option "${option.name}"`,
                  message.client.user.displayAvatarURL()
                )
                .setDescription(option.missingErrorMessage)
            } else {
              return option.missingErrorMessage
            }
          }

          return new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              `Missing option "${option.name}"`,
              message.client.user.displayAvatarURL()
            )
            .setDescription(
              option.description
                ? "Description: " + option.description
                : `Example: \`--${option.name}=someValue\``
            )
        }

        set(value)

        if (value === undefined) {
          if (option.default !== undefined) {
            set(await core.scrap(option.default, message))
          } else if (option.castValue !== "array") {
            set(null)
          }
        } else if (option.checkValue) {
          const checked = await argument.checkValue(
            option,
            "argument",
            value,
            message
          )

          if (checked !== true) return checked
        }

        if (value !== null && option.castValue) {
          const casted = await argument.castValue(
            option,
            "argument",
            value,
            message,
            set
          )

          if (casted !== true) return casted
        }

        if (value !== null && option.checkCastedValue) {
          const checked = await argument.checkCastedValue(
            option,
            "argument",
            value,
            message
          )

          if (checked !== true) return checked
        }
      }
    }

    if (cmd.options.flags) {
      for (const flag of cmd.options.flags) {
        let { given, nameIsGiven, value } = argument.resolveGivenArgument(
          context.parsedArgs,
          flag
        )

        const set = (v: boolean) => {
          message.args[flag.name] = v
          value = v
        }

        if (!nameIsGiven) set(false)
        else if (typeof value === "boolean") set(value)
        else if (/^(?:true|1|on|yes|oui)$/.test(value)) set(true)
        else if (/^(?:false|0|off|no|non)$/.test(value)) set(false)
        else {
          set(true)
          context.restPositional.unshift(value)
        }
      }
    }

    message.rest = context.restPositional.join(" ")

    if (cmd.options.rest) {
      const rest = await core.scrap(cmd.options.rest, message)

      if (rest.all) message.rest = context.baseContent

      if (message.rest.length === 0) {
        if (await core.scrap(rest.required, message)) {
          if (rest.missingErrorMessage) {
            if (typeof rest.missingErrorMessage === "string") {
              return new discord.MessageEmbed()
                .setColor("RED")
                .setAuthor(
                  `Missing rest "${rest.name}"`,
                  message.client.user.displayAvatarURL()
                )
                .setDescription(rest.missingErrorMessage)
            } else {
              return rest.missingErrorMessage
            }
          }

          return new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              `Missing rest "${rest.name}"`,
              message.client.user.displayAvatarURL()
            )
            .setDescription(
              rest.description ??
                "Please use `--help` flag for more information."
            )
        } else if (rest.default) {
          message.args[rest.name] = await core.scrap(rest.default, message)
        }
      } else {
        message.args[rest.name] = message.rest
      }
    }
  }

  if (cmd.options.middlewares) {
    const middlewares = await core.scrap(cmd.options.middlewares, message)

    let currentData: any = {}

    for (const middleware of middlewares) {
      const { result, data } = await middleware(message, currentData)

      currentData = {
        ...currentData,
        ...(data ?? {}),
      }

      if (typeof result === "string")
        return new discord.MessageEmbed()
          .setColor("RED")
          .setAuthor(
            `${
              middleware.name ? `"${middleware.name}" m` : "M"
            }iddleware error`,
            message.client.user.displayAvatarURL()
          )
          .setDescription(result)

      if (!result) return false
    }
  }

  return true
}

export async function sendCommandDetails<Type extends keyof CommandMessageType>(
  message: CommandMessageType[Type],
  cmd: Command<Type>
): Promise<void> {
  let pattern = `${message.usedPrefix}${
    cmd.options.isDefault
      ? `[${commandBreadcrumb(cmd)}]`
      : commandBreadcrumb(cmd)
  }`

  const positionalList: string[] = []
  const argumentList: string[] = []
  const flagList: string[] = []
  let restPattern = ""

  if (cmd.options.rest) {
    const rest = await core.scrap(cmd.options.rest, message)
    const dft =
      rest.default !== undefined
        ? `="${await core.scrap(rest.default, message)}"`
        : ""

    restPattern = (await core.scrap(rest.required, message))
      ? `<...${rest.name}>`
      : `[...${rest.name}${dft}]`
  }

  if (cmd.options.positional) {
    const cmdPositional = await core.scrap(cmd.options.positional, message)

    for (const positional of cmdPositional) {
      const dft =
        positional.default !== undefined
          ? `="${await core.scrap(positional.default, message)}"`
          : ""
      positionalList.push(
        (await core.scrap(positional.required, message)) && !dft
          ? `<${positional.name}>`
          : `[${positional.name}${dft}]`
      )
    }
  }

  if (cmd.options.options) {
    const cmdOptions = await core.scrap(cmd.options.options, message)

    for (const arg of cmdOptions) {
      const dft =
        arg.default !== undefined
          ? `="${core.scrap(arg.default, message)}"`
          : ""
      argumentList.push(
        (await core.scrap(arg.required, message))
          ? `\`--${arg.name}${dft}\` (\`${argument.getTypeDescriptionOf(
              arg
            )}\`) ${arg.description ?? ""}`
          : `\`[--${arg.name}${dft}]\` (\`${argument.getTypeDescriptionOf(
              arg
            )}\`) ${arg.description ?? ""}`
      )
    }
  }

  if (cmd.options.flags) {
    for (const flag of cmd.options.flags) {
      flagList.push(`[--${flag.name}]`)
    }
  }

  const specialPermissions = []

  if (await core.scrap(cmd.options.botOwnerOnly, message))
    specialPermissions.push("BOT_OWNER")
  if (await core.scrap(cmd.options.guildOwnerOnly, message))
    specialPermissions.push("GUILD_OWNER")

  const embed = new discord.MessageEmbed()
    .setColor("BLURPLE")
    .setAuthor("Command details", message.client.user.displayAvatarURL())
    .setTitle(
      `${pattern} ${[...positionalList, restPattern, ...flagList].join(" ")} ${
        cmd.options ? "[OPTIONS]" : ""
      }`
    )
    .setDescription(
      (await core.scrap(cmd.options.longDescription, message)) ??
        cmd.options.description ??
        "no description"
    )

  if (argumentList.length > 0)
    embed.addField("options", argumentList.join("\n"), false)

  if (cmd.options.aliases) {
    const aliases = cmd.options.aliases

    embed.addField(
      "aliases",
      aliases.map((alias) => `\`${alias}\``).join(", "),
      true
    )
  }

  if (cmd.options.examples) {
    const examples = await core.scrap(cmd.options.examples, message)

    embed.addField(
      "examples:",
      core.code.stringify({
        content: examples
          .map((example) => message.usedPrefix + example)
          .join("\n"),
      }),
      false
    )
  }

  if (cmd.options.botPermissions) {
    const botPermissions = await core.scrap(cmd.options.botPermissions, message)

    embed.addField("bot permissions", botPermissions.join(", "), true)
  }

  if (cmd.options.userPermissions) {
    const userPermissions = await core.scrap(
      cmd.options.userPermissions,
      message
    )

    embed.addField("user permissions", userPermissions.join(", "), true)
  }

  if (specialPermissions.length > 0)
    embed.addField(
      "special permissions",
      specialPermissions.map((perm) => `\`${perm}\``).join(", "),
      true
    )

  if (cmd.options.coolDown) {
    const coolDown = await core.scrap(cmd.options.coolDown, message)

    embed.addField("cool down", tims.duration(coolDown), true)
  }

  if (cmd.options.subs)
    embed.addField(
      "sub commands:",
      (
        await Promise.all(
          cmd.options.subs.map(async (sub: Command<any>) => {
            const prepared = await prepareCommand(message, sub)
            if (prepared !== true) return ""
            return commandToListItem(message, sub)
          })
        )
      )
        .filter((line) => line.length > 0)
        .join("\n") || "Sub commands are not accessible by you.",
      false
    )

  if (cmd.options.channelType !== "all")
    embed.setFooter(
      `This command can only be sent in ${cmd.options.channelType} channel.`
    )

  await message.channel.send({ embeds: [embed] })
}

export function commandToListItem<Type extends keyof CommandMessageType>(
  message: CommandMessageType[Type],
  cmd: Command<Type>
): string {
  return `**${message.usedPrefix}${commandBreadcrumb(cmd, " ")}** - ${
    cmd.options.description ?? "no description"
  }`
}

export function isNormalMessage(
  message: discord.Message | discord.PartialMessage
): message is NormalMessage {
  return (
    !message.system &&
    !!message.channel &&
    !!message.author &&
    !message.webhookId
  )
}

export function isGuildMessage(
  message: NormalMessage
): message is GuildMessage {
  return (
    !!message.member &&
    !!message.guild &&
    message.channel instanceof discord.GuildChannel
  )
}

export function isDirectMessage(
  message: NormalMessage
): message is DirectMessage {
  return message.channel instanceof discord.DMChannel
}
