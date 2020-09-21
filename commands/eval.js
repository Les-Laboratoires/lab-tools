
const discordEval = require("discord-eval.js")

const regex = /^(?:js|eval|javascript|code|run|exec|try)\s+/i

module.exports = (message) => {
  if(regex.test(message.content)){
    discordEval(message.content.replace(regex, ""), message)
      .catch(message.client.throw)
  }
  return false
}