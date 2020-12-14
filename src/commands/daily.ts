const tims = require("tims")
import * as app from "../app"

const command: app.Command = {
  name: "daily",
  aliases: ["dl", "day"],
  async run(message) {
    const lastTime = app.daily.ensure(message.author.id, 0)
    const today = Date.now()
    const day = 1000 * 60 * 60 * 24
    const yesterday = today - day

    const rest = lastTime - yesterday

    if (rest < 0) {
      app.daily.set(message.author.id, Date.now())

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
          format: "second",
        })} <:shrug:709330366967578625>`
      )
    }
  },
}

module.exports = command
