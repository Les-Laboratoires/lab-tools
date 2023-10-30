import * as app from "../app.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Launch the hourly check for tracker",
  once: true,
  async run(client) {
    setInterval(
      async () => {
        for (const guild of client.guilds.cache.values()) {
          await app.updateGuildOnlineCountTracker(guild)
          await app.updateGuildMessageCountTracker(guild)
        }
      },
      1000 * 60 * 5,
    ) // 5 minutes
  },
}

export default listener
