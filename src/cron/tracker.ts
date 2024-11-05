import * as app from "#app"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new app.Cron({
  name: "tracker",
  description: "A tracker cron",
  schedule: "hourly",
  async run() {
    for (const guild of app.client.guilds.cache.values()) {
      await app.updateGuildOnlineCountTracker(guild)
      await app.updateGuildMessageCountTracker(guild)
    }
  },
})
