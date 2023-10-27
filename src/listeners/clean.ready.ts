import chalk from "chalk"
import * as app from "../app.js"

import _user from "../tables/user.js"
import _guild from "../tables/guild.js"
import _message from "../tables/message.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Cleanup database",
  once: true,
  async run(client) {
    // Delete removed users

    await client.guilds.fetch()

    const members = (
      await Promise.all(
        client.guilds.cache.map(async (guild) =>
          Array.from((await guild.members.fetch({ force: true })).values()),
        ),
      )
    ).flat()

    for (const guild of client.guilds.cache.values()) {
      guild.members.cache.clear()
    }

    const messageCountBefore = await _message.count()
    const userCountBefore = await _user.count()

    const users = await _user.query.select("id")
    const guilds = await _guild.query.select("id")

    const deleteUsers = _user.query

    let first = true

    for (const user of users) {
      if (members.every((member) => member.id !== user.id)) {
        deleteUsers[first ? "where" : "orWhere"]("id", user.id)
        first = false
      }
    }

    await deleteUsers.del()

    first = true

    const deleteGuilds = _guild.query

    let guildCount = 0

    for (const guild of guilds) {
      if (!client.guilds.cache.has(guild.id)) {
        deleteGuilds[first ? "where" : "orWhere"]("id", guild.id)
        guildCount++
        first = false
      }
    }

    await deleteGuilds.del()

    const messageCountAfter = await _message.count()
    const userCountAfter = await _user.count()

    // todo cleanup message if a don't need to keep them

    app.log(
      `deleted ${chalk.blueBright(
        userCountBefore - userCountAfter,
      )} users, ${chalk.blueBright(guildCount)} guilds and ${chalk.blueBright(
        messageCountBefore - messageCountAfter,
      )} messages.`,
    )
  },
}

export default listener
