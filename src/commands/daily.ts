import tims from "tims"
import * as app from "../app"

const command: app.Command = {
  name: "daily",
  aliases: ["dl", "day"],
  async run(message) {
    if (message.author.bot) return

    const now = app.dayjs()

    const profile = app.getProfile(message.author.id)

    const { daily } = profile

    const last = app.dayjs(daily.last)

    if (last.date() !== now.date()) {
      daily.last = now.valueOf()

      if (app.dayjs(last).diff(now, "day") < 2) daily.combo++
      else daily.combo = 1

      profile.daily = daily

      app.setProfile(profile)

      const [min, max] = app.calculateMinMaxDaily(daily.combo)
      const gain = Math.round(Math.random() * (max - min + 1) + min)

      const success = await app.transaction("bank", [message.author.id], gain)

      if (success) {
        return message.channel.send(
          `Youhouuuu ! T'as gagné ${gain}${app.currency} <:yay:557124850326437888>\n(combo: ${daily.combo})`
        )
      } else {
        return message.channel.send(
          `La banque est en faillite ! Elle ne peut pas te payer... <:wtfhappened:744158053506744321>`
        )
      }
    } else {
      const midnight = now
        .add(1, "day")
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .set("millisecond", 0)

      const timeout = now.diff(midnight, "millisecond")

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
