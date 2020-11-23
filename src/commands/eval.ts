import discordEval from "discord-eval.ts"
import cp from "child_process"
import util from "util"
import * as app from "../app"

const exec = util.promisify(cp.exec)
const regex = /--(?:install|use|add|with|npm) +([a-z-_.]+)(?:, ?([a-z-_.]+))*/i

const packageJson = require("../../package.json")

const command: app.Command = {
  name: "js",
  botOwner: true,
  aliases: ["eval", "code", "run", "="],
  async run(message) {
    const match = regex.exec(message.content)
    const packages = []

    if (match) {
      message.content = message.content.replace(regex, "").trim()
      for (const pack of match.slice(1)) {
        if (
          !packageJson.dependencies.hasOwnProperty(pack) &&
          !packageJson.devDependencies.hasOwnProperty(pack)
        ) {
          try {
            await exec(`npm i ${pack}`)
            packages.push(pack)
          } catch (error) {}
        }
      }
    }

    if (
      message.content.split("\n").length === 1 &&
      !/const|let|return/.test(message.content)
    ) {
      message.content = "return " + message.content
    }

    await discordEval(message.content, message)

    for (const pack of packages) {
      try {
        await exec(`npm remove --purge ${pack}`)
        packages.push(pack)
      } catch (error) {}
    }
  },
}

module.exports = command
