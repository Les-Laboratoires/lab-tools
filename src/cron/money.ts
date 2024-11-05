import * as app from "#app"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new app.Cron({
  name: "money",
  description: "Give money to users hourly",
  schedule: "hourly",
  async run() {
    await app.giveHourlyCoins()
  },
})
