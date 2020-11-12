import * as app from "../app"

const discordEval = require("discord-eval.js")

const command: app.Command = {
  name: "eval",
  aliases: ["eval", "code", "run", "="],
  async run(message) {
    if (message.author.id !== app.ghom) return

    if (
      message.content.split("\n").length === 1 &&
      !message.content.includes("return")
    ) {
      message.content = "return " + message.content
    }

    return discordEval(message.content, message)
  }
}

module.exports = command