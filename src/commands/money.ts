import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS, S_IFMT } from "constants"
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

        const targets: (app.Discord.GuildMember|string)[] = []
        const IDRegex = /\d{18}/
        const mentionRegex = /<@\d{18}>/
        while(true) {
          const word = app.getArgument(message, 'word')
          if(!word) break;
          if(word.startsWith("company:")) {
            const company = app.companies.has(word.replace("company:", ""))
            if(company) {
              targets.push(word)
              continue
            }
          }
          if(IDRegex.test(word)) {
            const member = await message.guild.members.fetch(word)
            if(member) {
              targets.push(member)
              continue
            }
          }
          if(mentionRegex.test(word)) {
            const member = message.mentions.members?.first()
            if(member) {
              targets.push(member)
              message.mentions.users.delete(member.id)
              continue
            }
          }
          const member = (await message.guild.members.fetch({ query: word, limit: 1})).first()
          if(member) {
            targets.push(member)
            continue
          }
          return message.channel.send(`Aucun membre/entreprise ne correspond à ${word}`)
        }

        if(targets.length === 0) return message.channel.send(
          "Tu dois mentionner la ou les personnes / entreprise(s) ciblées  <:jpp:564431015377108992>"
        )

        const bank = message.content.includes("as bank")
        const taxed = bank ? "bank" : message.author.id

        const tax = targets.length * amount

        return app.transaction(
          taxed,
          targets.map(target => target instanceof app.Discord.GuildMember ? target.id : target),
          amount,
          (missing) => {
            if (missing) {
              return message.channel.send(
                bank
                  ? `La banque ne possède pas assez d'argent. Il manque ${missing}${app.currency}`
                  : `Tu ne possèdes pas assez d'argent <:lul:507420611484712971>\nIl te manque ${missing}${app.currency}`
              )
            } else {
              if (targets.length === 1) {
                return message.channel.send(
                  `${bank ? "La banque a" : "Tu as"} transféré ${tax}${
                    app.currency
                  } vers le compte de **${targets[0]}**`
                )
              } else {
                return message.channel.send(
                  `${bank ? "La banque a" : "Tu as"} perdu ${tax}${
                    app.currency
                  } en tout.\nLes membres suivants ont chacun reçus ${amount}${
                    app.currency
                  }.${app.code(
                    targets
                      .map((target) => {
                        return target.toString()
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

        const { combo } = app.daily.ensure(message.author.id, {
          combo: 0,
          last: -1,
        })

        const [dailyMin, dailyMax] = app.calculateMinMaxDaily(combo)

        if (bank) {
          return message.channel.send(
            `Il y a actuellement ${money}${app.currency} en banque.`
          )
        } else {
          return message.channel.send(
            `Vous possédez actuellement ${money}${
              app.currency
            }\nVotre taxe quotidienne s'élève à ${Math.floor(money * app.tax.privateTax)}${
              app.currency
            }\nVous avez cummulé ${combo} daily${
              combo > 1 ? "s" : ""
            }. Vous pouvez toucher entre ${dailyMin}${
              app.currency
            } et ${dailyMax}${app.currency} inclus au prochain daily.`
          )
        }
    }
  },
}

module.exports = command
