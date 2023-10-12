import * as app from "../app.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Launch the hourly check for tracker",
  async run(client) {
    setInterval(async () => {
      for (const guild of client.guilds.cache.values()) {
        await app.updateGuildOnlineCountTracker(guild)
      }
    }, 1000 * 60 * 60)
  },
}

export default listener
