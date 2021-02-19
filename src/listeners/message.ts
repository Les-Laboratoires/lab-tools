import * as app from "../app"
import yargsParser from "yargs-parser"

const listener: app.Listener<"message"> = {
  event: "message",
  async call(message) {
    if (!app.isCommandMessage(message)) return

    if (message.channel.id === app.emoteOnly) {
      if (/(?:^|\s)[^:]+(\s|$)/.test(message.cleanContent)) {
        return message.delete()
      }
    }

    // delete muted messages
    if (app.globals.ensure("muted", []).includes(message.author.id)) {
      return message.delete()
    }

    // presentations checks
    if (message.channel.id === app.presentations) {
      if (
        message.member.roles.cache.has(app.dickHead) ||
        message.member.roles.cache.has(app.validation) ||
        message.author.bot
      )
        return
      await message.member.roles.add(app.validation)
      await message.react(app.approved)
      await message.react(app.disapproved)
      return
    }

    const prefix = app.globals.ensure("prefix", process.env.PREFIX)

    if (message.content.startsWith(prefix)) {
      message.content = message.content.slice(prefix.length)
    } else {
      return
    }

    let key = message.content.split(/\s+/)[0]
    let cmd = app.commands.resolve(key)

    if (!cmd) {
      const cc = app.customCommands.get(key)
      if (cc) return message.channel.send(cc)
      return
    }

    // check sub commands
    {
      let cursor = 0
      let depth = 0

      while (cmd.subs && cursor < cmd.subs.length) {
        const subKey = message.content.split(/\s+/)[depth + 1]

        for (let sub of cmd.subs) {
          sub = app.resolve(sub)
          if (sub.name === subKey) {
            key += ` ${subKey}`
            cursor = 0
            cmd = sub
            depth++
            break
          } else if (sub.aliases) {
            for (const alias of sub.aliases) {
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

    // turn ON/OFF
    if (key !== "turn" && !app.cache.ensure("turn", true)) return

    // coolDown
    {
      const coolDownId = `${cmd.name}:${message.channel.id}`
      const coolDown = app.coolDowns.ensure(coolDownId, {
        time: 0,
        trigger: false,
      })

      if (cmd.coolDown && coolDown.trigger) {
        if (Date.now() > coolDown.time + cmd.coolDown) {
          app.coolDowns.set(coolDownId, {
            time: 0,
            trigger: false,
          })
        } else {
          return message.channel.send(
            new app.MessageEmbed()
              .setColor("RED")
              .setAuthor(
                `Please wait ${Math.ceil(
                  (coolDown.time + cmd.coolDown - Date.now()) / 1000
                )} seconds...`,
                message.client.user?.displayAvatarURL()
              )
          )
        }
      }
    }

    if (cmd.botOwner) {
      if (process.env.OWNER !== message.member.id) {
        return await message.channel.send(
          new app.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              "You must be my owner.",
              message.client.user?.displayAvatarURL()
            )
        )
      }
    }

    if (cmd.guildOwner) {
      if (message.guild.owner !== message.member) {
        return await message.channel.send(
          new app.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              "You must be the guild owner.",
              message.client.user?.displayAvatarURL()
            )
        )
      }
    }

    if (cmd.staffOnly) {
      if (!app.isStaff(message.member)) {
        return message.channel.send(
          new app.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              "You must be a member of staff.",
              message.client.user?.displayAvatarURL()
            )
        )
      }
    }

    // parse CommandMessage arguments
    {
      message.content = message.content.slice(key.length).trim()
      message.args = yargsParser(message.content) as app.CommandMessage["args"]
      message.rest = message.args._?.join(" ") ?? ""
      message.positional = (message.args._?.slice(0) ?? []).map(
        (positional) => {
          if (/^(?:".+"|'.+')$/.test(positional))
            return positional.slice(1, positional.length - 1)
          return positional
        }
      )
    }

    if (cmd.positional) {
      for (const positional of cmd.positional) {
        const index = cmd.positional.indexOf(positional)

        const getValue = () => message.positional[positional.name]
        const setValue = (value: any) => {
          message.positional[positional.name] = value
          message.positional[index] = value
        }

        const given = message.positional[index] !== undefined

        if (/^(?:".+"|'.+')$/.test(message.positional[index])) {
          message.positional[index] = message.positional[index].slice(
            1,
            message.positional[index].length - 2
          )
        }

        message.positional[positional.name] = message.positional[index]

        if (!given) {
          if (positional.default !== undefined) {
            setValue(
              typeof positional.default === "function"
                ? await positional.default(message)
                : positional.default
            )
          } else if (positional.required) {
            return await message.channel.send(
              new app.MessageEmbed()
                .setColor("RED")
                .setAuthor(
                  `Missing positional "${positional.name}"`,
                  message.client.user?.displayAvatarURL()
                )
                .setDescription(
                  positional.description
                    ? "Description: " + positional.description
                    : `Example: \`--${positional.name}=someValue\``
                )
            )
          }
        } else if (positional.checkValue) {
          const checked = await app.checkValue(
            positional,
            "positional",
            getValue(),
            message
          )

          if (!checked) return
        }

        if (positional.castValue) {
          const casted = await app.castValue(
            positional,
            "positional",
            getValue(),
            message,
            setValue
          )

          if (!casted) return
        }

        message.rest = message.rest
          .replace(message.args._?.[index] ?? "", "")
          .trim()
      }
    }

    if (cmd.args) {
      for (const arg of cmd.args) {
        const value = () => message.args[arg.name]

        let usedName = arg.name
        let given = message.args.hasOwnProperty(arg.name)

        if (!given && arg.aliases) {
          if (typeof arg.aliases === "string") {
            usedName = arg.aliases
            given = message.args.hasOwnProperty(arg.aliases)
          } else {
            for (const alias of arg.aliases) {
              if (message.args.hasOwnProperty(alias)) {
                usedName = alias
                given = true
                break
              }
            }
          }
        }

        if (!given && arg.isFlag && arg.flag) {
          usedName = arg.flag
          given = message.args.hasOwnProperty(arg.flag)
        }

        if (arg.required && !given)
          return await message.channel.send(
            new app.MessageEmbed()
              .setColor("RED")
              .setAuthor(
                `Missing argument "${arg.name}"`,
                message.client.user?.displayAvatarURL()
              )
              .setDescription(
                arg.description
                  ? "Description: " + arg.description
                  : `Example: \`--${arg.name}=someValue\``
              )
          )

        if (arg.isFlag)
          message.args[arg.name] = message.args.hasOwnProperty(usedName)
        else {
          message.args[arg.name] = message.args[usedName]

          if (value() === undefined) {
            if (arg.default !== undefined) {
              message.args[arg.name] =
                typeof arg.default === "function"
                  ? await arg.default(message)
                  : arg.default
            } else if (arg.castValue !== "array") {
              return await message.channel.send(
                new app.MessageEmbed()
                  .setColor("RED")
                  .setAuthor(
                    `Missing value for "${usedName}" argument`,
                    message.client.user?.displayAvatarURL()
                  )
                  .setDescription(
                    "Please add a `arg.default` value or activate the `arg.isFlag` property."
                  )
              )
            }
          } else if (arg.checkValue) {
            const checked = await app.checkValue(
              arg,
              "argument",
              value(),
              message
            )

            if (!checked) return
          }

          if (arg.castValue) {
            const casted = await app.castValue(
              arg,
              "argument",
              value(),
              message,
              (value) => (message.args[arg.name] = value)
            )

            if (!casted) return
          }
        }
      }
    }

    delete message.args._

    try {
      await cmd.run(message)
    } catch (error) {
      message.channel
        .send(
          app.toCodeBlock(
            `Error: ${error.message?.replace(/\x1b\[\d+m/g, "") ?? "unknown"}`,
            "js"
          )
        )
        .catch(console.error)
    }
  },
}

module.exports = listener
