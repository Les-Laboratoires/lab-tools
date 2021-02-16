import * as app from "../app"

const prettify = require("ghom-prettify")

const command: app.Command = {
  name: "pretty",
  aliases: ["beauty", "prettify", "beautify", "format", "prettier"],
  args: [
    {
      name: "semi",
      flag: "s",
      isFlag: true,
    },
  ],
  async run(message) {
    const match = app.codeBlockRegex.exec(message.rest)

    if (match) {
      const [, lang, code] = match

      const prettified = await prettify(code, lang, {
        semi: message.args.semi,
      })

      await message.channel.send(app.toCodeBlock(prettified, lang))
    } else {
      await message.channel.send(
        "Commande mal utilisée. Place ton code entre balises pour que je sache quel est son language."
      )
    }
  },
}

module.exports = command
