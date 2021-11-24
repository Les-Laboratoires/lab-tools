import * as app from "../app.js"

export default new app.Command({
  name: "globalBan",
  description: "The globalBan command",
  channelType: "all",
  async run(message) {
    // todo: code here
    return message.send("globalBan command is not yet implemented.")
  },
})
