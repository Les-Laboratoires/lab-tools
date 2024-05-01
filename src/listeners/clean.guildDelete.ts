import * as app from "#app"

import guilds from "#tables/guild.js"

const listener: app.Listener<"guildDelete"> = {
  event: "guildDelete",
  description: "Remove guild from db",
  async run(guild) {
    await guilds.query.delete().where("id", guild.id)
  },
}

export default listener
