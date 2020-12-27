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
      "ladder",
      "top",
      "leaderboard",
      "lead",
    ])

    // todo: ladder, log, target bank

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
      case "leaderboard":
      case "lead":
      case "top":
      case "ladder":
        key = "ladder"
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
      case "ladder": {
        return message.channel.send(
          new app.MessageEmbed()
            .setAuthor(`Leaderboard | ${app.currency}`)
            .setDescription(
              app.money
                .map((money, id) => ({
                  id,
                  score: money,
                }))
                .filter((el) => el.id !== "bank")
                .sort((a, b) => b.score - a.score)
                .slice(0, 15)
                .map((el, i, arr) => app.leaderItem(el, i, arr, app.currency))
                .join("\n")
            )
        )
      }

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
        const taxed = bank ? "bank" : message.author.id
        const members = message.mentions.members
        const tax = members.size * amount

        return app.transaction(
          taxed,
          members.map((m) => m.id),
          amount,
          (missing) => {
            if (missing) {
              return message.channel.send(
                bank
                  ? `La banque ne possède pas assez d'argent. Il manque ${missing}${app.currency}`
                  : `Tu ne possèdes pas assez d'argent <:lul:507420611484712971>\nIl te manque ${missing}${app.currency}`
              )
            } else {
              if (members.size === 1) {
                return message.channel.send(
                  `${bank ? "La banque a" : "Tu as"} transféré ${tax}${
                    app.currency
                  } vers le compte de **${members.first()?.user.tag}**`
                )
              } else {
                return message.channel.send(
                  `${bank ? "La banque a" : "Tu as"} perdu ${tax}${
                    app.currency
                  } en tout.\nLes membres suivants ont chacun reçus ${amount}${
                    app.currency
                  }.${app.code(
                    members
                      .map((member) => {
                        return member.displayName
                      })
                      .join("\n")
                  )}`
                )
              }
            }
          }
        )
      }
      default:
        const bank = message.content.includes("as bank")
        const money = app.money.ensure(bank ? "bank" : message.author.id, 0)
        const combo = app.ensurePath<number>(
          app.daily,
          message.author.id,
          0,
          "combo"
        )
        const [dailyMin, dailyMax] = app.calculateMinMaxDaily(combo)
        if (bank) {
          return message.channel.send(
            `Il y a actuellement ${money}${app.currency} en banque.`
          )
        } else {
          return message.channel.send(
            `Vous possédez actuellement ${money}${
              app.currency
            }\nVotre taxe quotidienne s'élève à ${Math.floor(money * app.tax)}${
              app.currency
            }\nVous avez cummulé ${combo} dailys. Vous pouvez toucher entre ${dailyMin}-${dailyMax}${
              app.currency
            } inclus. `
          )
        }
    }
  },
}

module.exports = command
