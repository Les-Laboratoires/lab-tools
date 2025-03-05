import { Cron } from "#core/cron"
import { checkReminds } from "#namespaces/remind"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new Cron({
  name: "remind",
  description: "Check reminders every minute",
  schedule: "minutely",
  async run() {
    await checkReminds()
  },
})
