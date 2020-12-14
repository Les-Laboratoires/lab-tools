import * as app from "../app"

const command: app.Command = {
  name: "money",
  aliases: ["$"],
  async run(message) {
    let key = app.getArgument(message, [
      "add",
      "gen",
      "create",
      "delete",
      "remove",
      "rm",
      "del",
      "give",
      "send",
    ])

    let amount = 0

    switch (key) {
      case "add":
      case "gen":
      case "create":
        key = "add"
        break
      case "delete":
      case "remove":
      case "rm":
      case "del":
        key = "remove"
        break
      case "give":
      case "send":
        key = "give"
        break
    }

    if (
      key === "add" ||
      key === "remove" ||
      (key === "give" && message.content.includes("as bank"))
    ) {
      if (message.author.id !== app.ghom) {
        return message.channel.send(
          "C'est Ghom qui gère les sous <:stalin:564536294512918548>"
        )
      }
    }

    switch (key) {
      case "add":
      case "remove":
      case "give":
        amount = app.getArgument(message, "number") ?? 0

        if (amount < 1) {
          return message.channel.send(
            "Le montant est incorrect <:hum:703399199382700114>"
          )
        }
    }

    switch (key) {
      case "add":
        app.money.set("bank", app.money.ensure("bank", 0) + amount)

        return message.channel.send(
          `Ok, ${amount}${app.currency} ont été ajoutés à la banque. <:STONKS:772181235526533150>`
        )
      case "remove":
        app.money.set("bank", app.money.ensure("bank", 0) - amount)

        return message.channel.send(
          `Ok, ${amount}${app.currency} ont été retirés de la banque. <:oui:703398234718208080>`
        )
      case "give": {
        if (!message.mentions.members || message.mentions.members.size === 0) {
          return message.channel.send(
            "Tu dois mentionner la ou les personnes ciblées <:jpp:564431015377108992>"
          )
        }

        const bank = message.content.includes("as bank")

        const money = app.money.ensure(bank ? "bank" : message.author.id, 0)

        const loss = message.mentions.members.size * amount

        if (loss > money) {
          return message.channel.send(
            bank
              ? `La banque ne possède pas assez d'argent. Il manque ${
                  loss - money
                }${app.currency}`
              : `Tu ne possèdes pas assez d'argent <:lul:507420611484712971>\nIl te manque ${
                  loss - money
                }${app.currency}`
          )
        }

        app.money.set(bank ? "bank" : message.author.id, money - loss)

        message.mentions.members.forEach((member) => {
          app.money.set(member.id, app.money.ensure(member.id, 0) + amount)
        })

        return message.channel.send(
          `${bank ? "La banque a" : "Tu as"} perdu ${loss}${
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
      }
      default:
        const bank = message.content.includes("as bank")
        const money = app.money.ensure(bank ? "bank" : message.author.id, 0)

        if (bank) {
          return message.channel.send(
            `Il y a actuellement ${money}${app.currency} en banque.`
          )
        } else {
          return message.channel.send(
            `Vous possédez actuellement ${money}${app.currency}`
          )
        }
    }
  },
}

module.exports = command
