import * as app from "../app"

const command: app.Command = {
  name: "money",
  aliases: ["$"],
  async run(message) {
    const key = app.getArgument(message)

    let amount = 0

    switch (key) {
      case "add":
      case "gen":
      case "create":
      case "delete":
      case "remove":
      case "rm":
      case "del":
        if (message.author.id !== app.ghom) {
          return message.channel.send(
            "C'est Ghom qui gère les sous <:stalin:564536294512918548>"
          )
        }
    }

    switch (key) {
      case "add":
      case "gen":
      case "create":
      case "delete":
      case "remove":
      case "rm":
      case "del":
      case "give":
      case "send":
        amount = app.getArgument(message, "number") ?? 0

        if (amount < 1) {
          return message.channel.send(
            "Le montant est incorrect <:hum:703399199382700114>"
          )
        }
    }

    switch (key) {
      case "add":
      case "gen":
      case "create":
        app.money.set("bank", app.money.ensure("bank", 0) + amount)

        return message.channel.send(
          `Ok, ${amount}${app.currency} ont été ajoutés à la banque. <:STONKS:772181235526533150>`
        )
      case "delete":
      case "remove":
      case "rm":
      case "del":
        app.money.set("bank", app.money.ensure("bank", 0) - amount)

        return message.channel.send(
          `Ok, ${amount}${app.currency} ont été retirés de la banque. <:oui:703398234718208080>`
        )
      case "give":
      case "send":
        if (!message.mentions.members || message.mentions.members.size === 0) {
          return message.channel.send(
            "Tu dois mentionner la ou les personnes ciblées <:jpp:564431015377108992>"
          )
        }

        const money = app.money.ensure(message.author.id, 0)

        const loss = message.mentions.members.size * amount

        if (loss > money) {
          return message.channel.send(
            `Tu ne possèdes pas assez d'argent <:lul:507420611484712971>\nIl te manque ${
              loss - money
            }${app.currency}`
          )
        }

        app.money.set(message.author.id, money - loss)

        message.mentions.members.forEach((member) => {
          app.money.set(member.id, app.money.ensure(member.id, 0) + amount)
        })

        return message.channel.send(
          `Tu as perdu ${loss}${
            app.currency
          } en tout.\nLes membres suivants ont chacun reçus ${amount}${
            app.currency
          }.${app.code(
            message.mentions.members
              .map((member) => {
                return member.displayName
              })
              .join("\n")
          )}`
        )
      default:
        return message.channel.send("<:what:657667833509052444>")
    }
  },
}

module.exports = command
