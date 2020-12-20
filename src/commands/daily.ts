import tims from "tims"
import * as app from "../app"

const command: app.Command = {
  name: "daily",
  aliases: ["dl", "day"],
  async run(message) {
    if (message.author.bot) return;
    
    const lastDay = app.daily.ensure(message.author.id, -1)
    const today = app.dayjs().date()

    const midnight = new Date()

    midnight.setHours(23)
    midnight.setMinutes(0)
    midnight.setMilliseconds(0)

    const rest = midnight.getTime() - Date.now()

    if (lastDay !== today) {
      app.daily.set(message.author.id, today)

      const gain = Math.round(10 + Math.random() * 10)

      const success = await app.transaction("bank", [message.author.id], gain)

      if (success) {
        return message.channel.send(
          `Youhouuuu ! T'as gagné ${gain}${app.currency} <:yay:557124850326437888>`
        )
      } else {
        return message.channel.send(
          `La banque est en faillite ! Elle ne peut pas te payer... <:wtfhappened:744158053506744321>`
        )
      }
    } else {
      return message.channel.send(
        `Nope ! Faut attendre ${tims.duration(rest, {
          locale: "fr",
          format: "minute",
        })} <:shrug:709330366967578625>`
      )
    }
  },
}

module.exports = command
