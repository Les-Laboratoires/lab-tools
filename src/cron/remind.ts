import * as app from "#app"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new app.Cron({
  name: "remind",
  description: "Check reminders every minute",
  schedule: "minutely",
  async run() {
    await app.checkReminds()
  },
})
