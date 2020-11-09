const Discord = require("discord.js")
const path = require("path")
const date = require("dayjs")
const db = require("./db")

const utils = require("./utils")

const client = new Discord.Client({ disableMentions: "all" })

date.locale("fr")

client.date = date
client.db = db
client.prefix = "!"
client.commands = new Discord.Collection()

utils
  .forFiles([path.join(__dirname, "commands")], function (filePath) {
    const cmd = require(filePath)
    client.commands.set(cmd.name, cmd.bind(client))
  })
  .catch(console.error)

utils
  .forFiles([path.join(__dirname, "listeners")], function (filePath) {
    const listener = require(filePath)
    client[listener.once ? "once" : "on"](listener.name, listener.bind(client))
  })
  .catch(console.error)

client.findCommand = function (text) {
  return this.commands.find((cmd) => {
    const aliases = cmd.aliases ?? []
    return (
      text.startsWith(cmd.name) ||
      aliases.some((alias) => text.startsWith(alias))
    )
  })
}

client.login(process.env.TOKEN).catch(console.error)

module.exports = client
