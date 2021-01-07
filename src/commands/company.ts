import * as app from "../app"

const command: app.Command = {
  name: "company",
  aliases: ["cny"],
  async run(message) {
    let key = app.getArgument(message, [
        "list",
        "create",
        "remove",
        "join"
    ])
    
    switch(key) {
        case "list":
        case "create":
        case "remove":
        case "join":
        default:
            return message.channel.send(`Not yet implemented`)
    }
  },
}

module.exports = command
