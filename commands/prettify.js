const prettify = require("ghom-prettify")
const utils = require("../utils")

const regex = /^```([a-z-]+)?\s(.+[^\\])```$/is

/**
 * @param {module:"discord.js".Message} message
 */
module.exports = async function pretty(message) {
  const match = regex.exec(message.content)

  if (match) {
    const [, lang, code] = match

    const prettified = await prettify(code, lang)

    await message.channel.send(utils.code(prettified, lang))
  } else {
    await message.channel.send(
      "Commande mal utilisée. Place ton code entre balises pour que je sache quel est son language.",
    )
  }
}

module.exports.aliases = [
  "beauty",
  "prettify",
  "beautify",
  "format",
  "prettier",
]
