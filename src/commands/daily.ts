const tims = require("tims")
import * as app from "../app"

const command: app.Command = {
  name: "daily",
  aliases: ["dl", "day"],
  async run(message) {
    const lastDay = app.daily.ensure(message.author.id, -1)
    const today = app.dayjs().date()

    const midnight = new Date()

    midnight.setHours(0)
    midnight.setMinutes(0)
    midnight.setMilliseconds(0)
    midnight.setDate(midnight.getDate() + 1)

    const rest = midnight.getTime() - Date.now()

    if (lastDay !== today) {
      app.daily.set(message.author.id, today)

      const gain = Math.round(10 + Math.random() * 10)

      app.money.set(
        message.author.id,
        app.money.ensure(message.author.id, 0) + gain
      )

      return message.channel.send(
        `Youhouuuu ! T'as gagné ${gain}${app.currency} <:yay:557124850326437888>`
      )
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
