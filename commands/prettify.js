const prettify = require("ghom-prettify")
const codeBlock = require("../utils/codeBlock")

const regex = /^(?:pf|prett?[iy]f?[iy](?:er)?)\s+```([a-z-]+)?\s(.+[^\\])```$/is

module.exports = async (message) => {
  const match = regex.exec(message.content)

  if (match) {
    const [, lang, code] = match

    try {
      const prettified = await prettify(code, lang)
      await message.channel.send(codeBlock(prettified, lang))
    } catch (error) {
      await message.channel.send(
        "une erreur s'est produite. " +
          codeBlock(error.name + ": " + error.message, "js"),
      )
    }
  } else {
    return false
  }
}
