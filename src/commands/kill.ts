import * as app from "../app.js"

export default new app.Command({
  name: "kill",
  description: "The kill command",
  channelType: "all",
  async run(message) {
    // todo: code here
    return message.send("kill command is not yet implemented.")
  }
})