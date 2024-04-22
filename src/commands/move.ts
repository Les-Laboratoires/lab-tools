import * as app from "../app.js"

export default new app.Command({
  name: "move",
  description: "The move command",
  channelType: "all",
  async run(message) {
    // todo: code here
    return message.channel.send("move command is not yet implemented.")
  }
})