import * as app from "../app"

module.exports = new app.Command({
  name: "ladder",
  aliases: ["top", "lb", "leaderboard"],
  description: "The leaderboard",
  channelType: "all",
  async run(message) {
    // todo: code here
    await message.reply("ladder command is not yet implemented.")
  },
})
