import tims from "tims"
import * as app from "../app"

const command: app.Command = {
  name: "daily",
  aliases: ["dl", "day"],
  async run(message) {
    if (message.author.bot) return

    const now = app.dayjs()

    const lastDay = app.ensurePath<number>(
      app.daily,
      message.author.id,
      -1,
      "last"
    )

    const lasted = now.diff(lastDay)
    if (lasted > 8.64e7) {
      app.daily.set(message.author.id, now.valueOf(), "last")

      if (lasted < 1.728e8) app.daily.inc(message.author.id, "combo")
      else app.daily.set(message.author.id, 1, "combo")

      const combo = app.ensurePath<number>(
        app.daily,
        message.author.id,
        1,
        "combo"
      )
      const [min, max] = app.calculateMinMaxDaily(combo)
      const gain = Math.round(Math.random() * (max - min + 1) + min)

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
      const now = app.dayjs()

      const endCooldown =
        app.ensurePath<number>(app.daily, message.author.id, -1, "last") +
        8.64e7

      const timeout = now.diff(endCooldown).valueOf()

      return message.channel.send(
        `Nope ! Faut attendre ${tims.duration(timeout, {
          locale: "fr",
          format: "minute",
        })} <:shrug:709330366967578625>`
      )
    }
  },
}

module.exports = command
