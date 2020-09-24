const discordEval = require("discord-eval.js")

const regex = /^(?:js|eval|javascript|code|run|exec|try)\s+/i
const authorized = [
  "272676235946098688",
  "386893236498857985",
  "352176756922253321",
]

module.exports = (message) => {
  if (!authorized.includes(message.author.id) || regex.test(message.content))
    return false

  discordEval(message.content.replace(regex, ""), message).catch(
    message.client.throw,
  )
}
