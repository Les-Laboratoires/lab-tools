import * as app from "../app.js"

import * as prettify from "ghom-prettify"

export default new app.Command({
  name: "format",
  description: "Format the given code",
  aliases: ["beautify", "prettier"],
  channelType: "all",
  async run(message) {
    const code = app.code.parse(message.rest)

    if (code) {
      const { lang, content } = code

      const prettified = await prettify.format(content, {
        lang: lang as any,
        semi: false,
        printWidth: 86,
      })

      await message.channel.send(
        app.code.stringify({
          content: prettified,
          lang,
        }),
      )
    } else {
      await message.channel.send(
        `${app.emote(message, "DENY")} Bad usage, please use code block tags`,
      )
    }
  },
})
