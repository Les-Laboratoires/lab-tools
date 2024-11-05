import * as app from "#app"

import guilds from "#tables/guild.ts"

export default new app.Listener({
  event: "guildDelete",
  description: "Remove guild from db",
  async run(guild) {
    await guilds.query.delete().where("id", guild.id)
  },
})
