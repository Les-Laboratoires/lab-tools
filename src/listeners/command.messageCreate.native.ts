// system file, please don't modify it

import * as app from "#app"
import config from "#config"
import yargsParser from "yargs-parser"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Handle messages for commands",
  async run(message) {
    if (config.ignoreBots && message.author.bot) return

    if (!app.isNormalMessage(message)) return

    const prefix = await config.getPrefix(message)

    if (new RegExp(`^<@!?${message.client.user.id}>$`).test(message.content))
      return message.channel
        .send(
          await app.getSystemMessage("default", {
            description: `My prefix is \`${prefix}\``,
          }),
        )
        .catch()

    message.usedAsDefault = false
    message.isFromBotOwner = message.author.id === app.env.BOT_OWNER

    app.emitMessage(message.channel, message)
    app.emitMessage(message.author, message)

    if (app.isGuildMessage(message)) {
      message.isFromGuildOwner =
        message.isFromBotOwner || message.guild.ownerId === message.author.id

      app.emitMessage(message.guild, message)
      app.emitMessage(message.member, message)
    }

    let dynamicContent = message.content

    const cut = function (key: string) {
      dynamicContent = dynamicContent.slice(key.length).trim()
    }

    const mentionRegex = new RegExp(`^(<@!?${message.client.user.id}>) ?`)

    if (dynamicContent.startsWith(prefix)) {
      message.usedPrefix = prefix
      cut(prefix)
    } else if (mentionRegex.test(dynamicContent)) {
      const [match, used] = mentionRegex.exec(dynamicContent) as RegExpExecArray
      message.usedPrefix = `${used} `
      cut(match)
    } else return

    let key = dynamicContent.split(/\s+/)[0]

    // turn ON/OFF
    if (
      key !== "turn" &&
      !app.cache.ensure<boolean>("turn", true) &&
      message.author.id !== app.env.BOT_OWNER
    )
      return

    let cmd = app.commands.resolve(key)

    if (!cmd) {
      if (app.defaultCommand) {
        key = ""
        cmd = app.defaultCommand
        message.usedAsDefault = true
      } else return null
    }

    // check sub commands
    {
      let cursor = 0
      let depth = 0

      while (cmd.options.subs && cursor < cmd.options.subs.length) {
        const subKey = dynamicContent.split(/\s+/)[depth + 1]

        for (const sub of cmd.options.subs) {
          if (sub.options.name === subKey) {
            key += ` ${subKey}`
            cursor = 0
            cmd = sub
            depth++
            break
          } else if (sub.options.aliases) {
            for (const alias of sub.options.aliases) {
              if (alias === subKey) {
                key += ` ${subKey}`
                cursor = 0
                cmd = sub
                depth++
              }
            }
          }
          cursor++
        }
      }
    }

    cut(key.trim())

    const baseContent = dynamicContent

    // parse CommandMessage arguments
    const parsedArgs = yargsParser(dynamicContent)
    const restPositional = (parsedArgs._?.slice() ?? []).map(String)

    message.args = restPositional.map((positional) => {
      if (/^(?:".+"|'.+')$/.test(positional))
        return positional.slice(1, positional.length - 1)
      return positional
    })

    // handle help argument
    if (parsedArgs.help || parsedArgs.h)
      return app.sendCommandDetails(message, cmd)

    // prepare command
    const prepared = await app.prepareCommand(message, cmd, {
      restPositional,
      baseContent,
      parsedArgs,
      key,
    })

    if (typeof prepared !== "boolean")
      return message.channel.send(prepared).catch()

    if (!prepared) return

    try {
      await cmd.options.run.bind(cmd)(message)
    } catch (error: any) {
      app.error(error, cmd.filepath!, true)

      message.channel
        .send(await app.getSystemMessage("error", { error }))
        .catch((error) => {
          app.error(error, cmd!.filepath!, true)
        })
    }
  },
}

export default listener
