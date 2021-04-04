import * as app from "../app"
import prettier from "prettier"

const command: app.Command = {
  name: "format",
  aliases: ["beautify", "prettier"],
  description: "Format the given code",
  async run(message) {
    const code = app.CODE.parse(message.rest)

    if (code) {
      const { lang, content } = code

      const prettified = prettier.format(content)

      await message.channel.send(
        app.CODE.stringify({
          content: prettified,
          lang,
        })
      )
    } else {
      await message.channel.send(
        `${message.client.emojis.resolve(
          app.Emotes.DENY
        )} Bas usage, please use code block tags`
      )
    }
  },
}

module.exports = command
