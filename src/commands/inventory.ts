import * as app from "../app"

const command: app.Command = {
  name: "inventory",
  aliases: ["i", "bag"],
  async run(message) {
    // todo: code here
    await message.reply("inventory command is not yet implemented.")
  },
}

module.exports = command
