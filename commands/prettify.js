const prettify = require("ghom-prettify")
const utils = require("../utils")

const regex = /^```([a-z-]+)?\s(.+[^\\])```$/is

module.exports = async function pretty(message) {
  const options = {}

  if (message.content.includes("--semi")) {
    options.semi = true
    message.content = message.content.replace("--semi", "").trim()
  }

  const match = regex.exec(message.content)

  if (match) {
    const [, lang, code] = match

    const prettified = await prettify(code, lang, options)

    await message.channel.send(utils.code(prettified, lang))
  } else {
    await message.channel.send(
      "Commande mal utilisée. Place ton code entre balises pour que je sache quel est son language."
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
