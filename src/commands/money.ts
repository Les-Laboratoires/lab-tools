import * as app from "../app"

const command: app.Command = {
  name: "money",
  aliases: ["$"],
  async run(message) {
    // todo: code here
    await message.reply("money command is not yet implemented.")
  },
}

module.exports = command
