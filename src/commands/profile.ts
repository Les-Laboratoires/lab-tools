import * as app from "../app"

module.exports = new app.Command({
  name: "profile",
  description: "The profile command",
  channelType: "all",
  async run(message) {
    // todo: code here
    await message.reply("profile command is not yet implemented.")
  },
})
