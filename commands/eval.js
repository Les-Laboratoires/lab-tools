const discordEval = require("discord-eval.js")
const utils = require("../utils")

module.exports = function js(message) {
  if (message.author.id !== utils.ghom) return

  if (
    message.content.split("\n").length === 1 &&
    !message.content.includes("return")
  ) {
    message.content = "return " + message.content
  }

  return discordEval(message.content, message)
}

module.exports.aliases = ["eval", "code", "run", "="]
