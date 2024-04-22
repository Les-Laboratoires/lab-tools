import * as app from "../app.js"

export default new app.Command({
  name: "remind",
  description: "The remind command",
  channelType: "all",
  async run(message) {
    // todo: code here
    return message.channel.send("remind command is not yet implemented.")
  }
})