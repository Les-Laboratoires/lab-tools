import evaluate from "ghom-eval"
import cp from "child_process"
import util from "util"
import * as app from "../app"

const exec = util.promisify(cp.exec)

const packageJson = require(app.rootPath("package.json"))

const alreadyInstalled = (pack: string): boolean =>
  packageJson.dependencies.hasOwnProperty(pack) ||
  packageJson.devDependencies.hasOwnProperty(pack)

const command: app.Command = {
  name: "eval",
  botOwner: true,
  aliases: ["js", "code", "run", "="],
  description: "JS code evaluator",
  args: [
    {
      name: "packages",
      aliases: ["use", "u", "req", "require", "import", "i"],
      castValue: "array",
      description: "NPM packages I want to includes in my code",
    },
  ],
  flags: [
    {
      name: "muted",
      aliases: ["mute", "silent"],
      flag: "m",
      description: "Disable message feedback",
    },
  ],
  async run(message) {
    const installed = new Set<string>()

    if (message.args.packages.length > 0) {
      const given = new Set<string>(
        message.args.packages.filter((p: string) => p)
      )

      for (const pack of given) {
        if (alreadyInstalled(pack)) {
          await message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.CHECK
            )} **${pack}** - installed`
          )
          installed.add(pack)
        } else {
          let log
          try {
            log = await message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.WAIT
              )} **${pack}** - install...`
            )
            await exec(`npm i ${pack}@latest`)
            await log.edit(
              `${message.client.emojis.resolve(
                app.Emotes.CHECK
              )} **${pack}** - installed`
            )
            installed.add(pack)
          } catch (error) {
            if (log)
              await log.edit(
                `${message.client.emojis.resolve(
                  app.Emotes.DENY
                )} **${pack}** - error`
              )
            else
              await message.channel.send(
                `${message.client.emojis.resolve(
                  app.Emotes.DENY
                )} **${pack}** - error`
              )
          }
        }
      }
    }

    if (app.CODE.pattern.test(message.rest))
      message.rest = message.rest.replace(app.CODE.pattern, "$2")

    if (
      message.rest.split("\n").length === 1 &&
      !/const|let|return/.test(message.rest)
    ) {
      message.rest = "return " + message.rest
    }

    message.rest = `${
      message.rest.includes("app")
        ? 'const _path = require("path");const _root = process.cwd();const _app_path = _path.join(_root, "dist", "app.js");const app = require(_app_path);'
        : ""
    } ${
      message.args.packages.length > 0
        ? `const req = {${[...installed]
            .map((pack) => `"${pack}": require("${pack}")`)
            .join(", ")}};`
        : ""
    } ${message.rest}`

    const evaluated = await evaluate(message.rest, message, "message")

    if (message.args.muted) {
      await message.channel.send(
        `${message.client.emojis.resolve(
          app.Emotes.CHECK
        )} successfully evaluated in ${evaluated.duration}ms`
      )
    } else {
      await message.channel.send(
        new app.MessageEmbed()
          .setColor(evaluated.failed ? "RED" : "BLURPLE")
          .setAuthor(
            `Result of JS evaluation ${evaluated.failed ? "(failed)" : ""}`,
            message.client.emojis.resolve(
              evaluated.failed ? app.Emotes.DENY : app.Emotes.CHECK
            )?.url
          )
          .setDescription(
            app.CODE.stringify({
              content: evaluated.output.slice(0, 2000),
              lang: "js",
            })
          )
          .addField(
            "Information",
            app.CODE.stringify({
              content: `type: ${evaluated.type}\nclass: ${evaluated.class}\nduration: ${evaluated.duration}ms`,
              lang: "yaml",
            })
          )
      )
    }

    for (const pack of installed) {
      if (alreadyInstalled(pack)) continue
      let log
      try {
        log = await message.channel.send(
          `<a:wait:560972897376665600> **${pack}** - uninstall...`
        )
        await exec(`npm remove --purge ${pack}`)
        await log.edit(
          `${message.client.emojis.resolve(
            app.Emotes.MINUS
          )} **${pack}** - uninstalled`
        )
      } catch (error) {
        if (log)
          await log.edit(
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} **${pack}** - error`
          )
        else
          await message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} **${pack}** - error`
          )
      }
    }

    return message.channel.send(
      `${message.client.emojis.resolve(app.Emotes.CHECK)} process completed`
    )
  },
}

module.exports = command
