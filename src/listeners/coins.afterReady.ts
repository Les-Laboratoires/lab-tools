import * as app from "#app"

const listener: app.Listener<"afterReady"> = {
  event: "afterReady",
  description: "Gain coins hourly according to the user's points & ratings",
  async run() {
    await app.giveHourlyCoins()

    setInterval(
      async () => {
        await app.giveHourlyCoins()
      },
      1000 * 60 * 60,
    )
  },
}

export default listener
