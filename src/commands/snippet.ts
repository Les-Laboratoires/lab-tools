import discordEval from "discord-eval.ts"
import * as app from "../app"

const command: app.Command = {
  name: "snippet",
  botOwner: true,
  aliases: ["!", "fn", "function", "snippets", "functions"],
  positional: [
    {
      name: "key",
      required: true,
      checkValue: (value) => app.snippets.has(value),
    },
  ],
  args: [
    {
      name: "muted",
      flag: "m",
      aliases: ["silent", "mute", "quiet", "q"],
      isFlag: true,
    },
  ],
  async run(message) {
    const snippet = app.snippets.get(message.positional.key) as string
    return discordEval(snippet, message, message.args.muted)
  },
  subs: [
    {
      name: "add",
      aliases: ["set"],
      botOwner: true,
      positional: [
        {
          name: "key",
          required: true,
        },
      ],
      async run(message) {
        const match = app.jsCodeBlockRegex.exec(message.rest)
        const code = match ? match[1] : message.rest

        if (!code.trim()) {
          return message.channel.send(
            "Ton snippet est vide <:what:657667833509052444>"
          )
        }

        app.snippets.set(message.positional.key, code)

        return message.channel.send(
          "Ok le snippet est enregistré." + app.toCodeBlock(code, "js")
        )
      },
    },
    {
      name: "remove",
      aliases: ["rm", "delete", "del"],
      botOwner: true,
      positional: [
        {
          name: "key",
          required: true,
          checkValue: (value) => app.snippets.has(value),
        },
      ],
      async run(message) {
        app.snippets.delete(message.positional.key)

        return message.channel.send("Ok le snippet est effacé.")
      },
    },
    {
      name: "list",
      aliases: ["ls"],
      async run(message) {
        return message.channel.send(app.snippets.keyArray().join(", "))
      },
    },
    {
      name: "show",
      aliases: ["display", "view"],
      positional: [
        {
          name: "key",
          required: true,
          checkValue: (value) => app.snippets.has(value),
        },
      ],
      async run(message) {
        return message.channel.send(
          `Code du snippet \`${message.positional.key}\`: ${app.toCodeBlock(
            app.snippets.get(message.positional.key) as string,
            "js"
          )}`
        )
      },
    },
  ],
}

module.exports = command
