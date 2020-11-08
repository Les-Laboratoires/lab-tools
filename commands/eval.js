const discordEval = require("discord-eval.js")

const authorized = [
  "272676235946098688",
  "386893236498857985",
  "352176756922253321",
]

module.exports = function js(message) {
  if (!authorized.includes(message.author.id)) return

  if (
    message.content.split("\n").length === 1 &&
    !message.content.includes("return")
  ) {
    message.content = "return " + message.content
  }

  return discordEval(message.content, message)
}

module.exports.aliases = ["eval", "code", "run", "="]
