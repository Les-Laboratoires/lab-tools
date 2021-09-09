import * as app from "../app.js"

import guilds from "../tables/guilds.js"

const listener: app.Listener<"guildDelete"> = {
  event: "guildDelete",
  async run(guild) {
    await guilds.query.delete().where("id", guild.id)
  },
}

export default listener
