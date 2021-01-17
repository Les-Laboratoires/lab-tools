import discordEval from "discord-eval.ts"
import * as app from "../app"

const command: app.Command = {
  name: "snippet",
  botOwner: true,
  aliases: [
    "snip",
    "snippets",
    "record",
    "rec",
    "call",
    "!",
    "fn",
    "function",
    "functions",
  ],
  args: [
    {
      name: "muted",
      aliases: ["silent", "mute", "quiet", "q"],
      flag: true,
    },
  ],
  async run(message) {
    const key = message.args.rest

    if (!key) {
      return message.channel.send("bite")
    } else {
      const snippet = app.snippets.get(key)
      if (snippet) {
        return discordEval(snippet, message, message.args.muted)
      } else {
        return message.channel.send("Snippet inexistant.")
      }
    }
  },
  subs: [
    {
      name: "add",
      aliases: ["set"],
      botOwner: true,
      args: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const name = message.args.name
        const match = app.jsCodeBlockRegex.exec(message.args.rest)
        const code = match ? match[1] : message.args.rest

        if (!code.trim()) {
          return message.channel.send(
            "Ton snippet est vide <:what:657667833509052444>"
          )
        }

        app.snippets.set(name, code)

        return message.channel.send(
          "Ok le snippet est enregistré." + app.code(code, "js")
        )
      },
    },
    {
      name: "remove",
      aliases: ["rm", "delete", "del"],
      botOwner: true,
      args: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const name = message.args.name

        if (!app.snippets.has(name)) {
          return message.channel.send("Snippet inexistant.")
        }

        app.snippets.delete(name)

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
      args: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const name = message.args.name

        if (!name)
          return message.channel.send(
            "Il manque un peu le nom du snippet là quand même"
          )

        if (!app.snippets.has(name)) {
          return message.channel.send("Snippet inexistant.")
        }

        return message.channel.send(
          `Code du snippet \`${name}\`: ${app.code(
            app.snippets.get(name) as string,
            "js"
          )}`
        )
      },
    },
  ],
}

module.exports = command
