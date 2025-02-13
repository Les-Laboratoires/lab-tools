import { Cron } from "#core/cron"
import { giveHourlyCoins } from "#namespaces/coins"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new Cron({
  name: "money",
  description: "Give money to users hourly",
  schedule: "hourly",
  async run() {
    await giveHourlyCoins()
  },
})
