import tims from "tims"
import * as app from "../app"

const command: app.Command = {
  name: "daily",
  aliases: ["dl", "day"],
  async run(message) {
    if (message.author.bot) return
    
    const today = app.dayjs()
    const lastDay = app.dayjs(app.daily.ensure(message.author.id, today.toObject(), "last"))

    const lasted = today.diff(lastDay)
    if (lasted > 8.64e+7) {
      app.daily.set(message.author.id, today, "last")
      
      if (lasted < 1.728e+8) app.daily.inc(message.author.id, "combo")
      else app.daily.set(message.author.id, 1, "combo")

      const combo = app.daily.ensure(message.author.id, 1, "combo")

      const gain = Math.round(10*Math.min(combo, app.maxcombo) + Math.random() * Math.min(combo, app.maxcombo))

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
      const midnight = app
        .dayjs()
        .add(1, "date")
        .set("hour", 0)
        .set("minute", 0)
        .set("millisecond", 0)

      const timeout = midnight.diff(new Date()).valueOf()

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
