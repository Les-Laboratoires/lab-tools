import { code } from "discord-eval.ts"
import * as prettify from "ghom-prettify"

import { Command } from "#core/index"

import { emote } from "#namespaces/emotes"

export default new Command({
  name: "format",
  description: "Format the given code",
  aliases: ["beautify", "prettier"],
  channelType: "all",
  async run(message) {
    const _code = code.parse(message.rest)

    if (_code) {
      const { lang, content } = _code

      const prettified = await prettify.format(content, {
        lang: lang as any,
        semi: false,
        printWidth: 86,
      })

      await message.channel.send(
        await code.stringify({
          content: prettified,
          lang,
        }),
      )
    } else {
      await message.channel.send(
        `${emote(message, "Cross")} Bad usage, please use code block tags`,
      )
    }
  },
})
