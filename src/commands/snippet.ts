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
  async run(message) {
    const key = app.getArgument(message)

    switch (key) {
      case "add":
      case "set": {
        const name = app.getArgument(message)

        if (!name) {
          return message.channel.send(
            "Il manque un peu le nom du snippet là quand même"
          )
        }

        const match = app.codeRegex.exec(message.content)
        const code = match ? match[1] : message.content

        if (!code.trim()) {
          return message.channel.send(
            "Ton snippet est vide <:what:657667833509052444>"
          )
        }

        app.snippets.set(name, code)

        return message.channel.send(
          "Ok le snippet est enregistré." + app.code(code, "js")
        )
      }
      case "remove":
      case "rm":
      case "delete":
      case "del": {
        const name = app.getArgument(message)

        if (!name)
          return message.channel.send(
            "Il manque un peu le nom du snippet là quand même"
          )

        if (!app.snippets.has(name)) {
          return message.channel.send("Snippet inexistant.")
        }

        app.snippets.delete(name)

        return message.channel.send("Ok le snippet est effacé.")
      }
      case "list": {
        return message.channel.send(app.snippets.keyArray().join(", "))
      }
      case "display":
      case "view":
      case "show": {
        const name = app.getArgument(message)

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
      }
      default: {
        if (!key) {
          return message.channel.send("bite")
        } else {
          const snippet = app.snippets.get(key)
          if (snippet) {
            return discordEval(snippet, message, snippet.includes("@muted"))
          } else {
            return message.channel.send("Snippet inexistant.")
          }
        }
      }
    }
  },
}

module.exports = command
