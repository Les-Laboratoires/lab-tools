import * as app from "../app.js"

import cron from "cron"

import cronTable from "../tables/cron.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Resurrect started cron",
  once: true,
  async run(client) {
    const cronList = await cronTable.query.where({
      started: true,
    })

    for (const cronTask of cronList) {
      await app.startCron(
        client,
        cronTask,
        client.guilds.cache.find((guild) => {
          return guild.channels.cache.has(cronTask.channel_id)
        })
      )
    }
  },
}

export default listener
