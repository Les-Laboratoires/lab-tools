import discordEval from "discord-eval.ts"
import * as app from "../app"

const command: app.Command = {
  name: "js",
  botOwner: true,
  aliases: ["eval", "code", "run", "="],
  async run(message) {
    if (
      message.content.split("\n").length === 1 &&
      !/const|let|return/.test(message.content)
    ) {
      message.content = "return " + message.content
    }

    return discordEval(message.content, message)
  },
}

module.exports = command
