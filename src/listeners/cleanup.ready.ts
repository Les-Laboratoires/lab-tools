import * as app from "../app.js"

import _user from "../tables/user.js"
import _guild from "../tables/guild.js"
import _message from "../tables/message"
import chalk from "chalk"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Cleanup database",
  once: true,
  async run(client) {
    // Delete removed users

    const users = await _user.query.select("id")
    const guilds = await _guild.query.select("id")

    let userCount = 0
    let guildCount = 0

    for (const user of users) {
      if (!client.users.cache.has(user.id)) {
        await _user.query.where("id", user.id).del()
        userCount++
      }
    }

    for (const guild of guilds) {
      if (!client.guilds.cache.has(guild.id)) {
        await _guild.query.where("id", guild.id).del()
        guildCount++
      }
    }

    // todo cleanup message if a don't need to keep them

    app.log(
      `Deleted ${chalk.blueBright(userCount)} users, ${chalk.blueBright(
        guildCount
      )} guilds and ${chalk.blueBright(0)} messages.`
    )
  },
}

export default listener
