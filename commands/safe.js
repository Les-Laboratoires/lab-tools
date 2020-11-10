const safeEval = require("safe-eval")
const utils = require("../utils")

module.exports = async function safe(message) {
  if (message.author.id !== utils.ghom && message.author.id !== utils.loockeeer)
    return
  const evaluated = safeEval(message.content)
  await message.channel.send(evaluated)
}
