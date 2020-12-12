import * as app from "../app"

const command: app.Command = {
  name: "money",
  aliases: ["$"],
  async run(message) {
    const key = app.getArgument(message)
    switch (key) {
      case "add":
      case "gen":
      case "create": {
        const amount = app.getArgument(message, "number") ?? 0

        if (message.author.id !== app.ghom) {
          return message.channel.send(
            "C'est Ghom qui crée les sous <:stalin:564536294512918548>"
          )
        }

        if (amount < 1) {
          return message.channel.send(
            "Le montant est incorrect <:hum:703399199382700114>"
          )
        }

        app.money.set("bank", app.money.ensure("bank", 0) + amount)

        return message.channel.send(
          `Ok, ${amount}Ɠ ont été ajoutés à la banque. <:oui:703398234718208080>`
        )
      }
    }
  },
}

module.exports = command
