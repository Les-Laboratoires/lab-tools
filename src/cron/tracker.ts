import * as app from "#app"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new app.Cron({
  name: "tracker",
  description: "Update the guild tracker every 5 minutes",
  schedule: {
    type: "minute",
    minute: 5,
  },
  async run() {
    for (const guild of app.client.guilds.cache.values()) {
      await app.updateGuildOnlineCountTracker(guild)
      await app.updateGuildMessageCountTracker(guild)
    }
  },
})
