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
    const guilds = await app.client.guilds.fetch()

    for (const partialGuild of guilds.values()) {
      const guild = await partialGuild.fetch()

      await app.updateGuildOnlineCountTracker(guild)
      await app.updateGuildMessageCountTracker(guild)
    }
  },
})
