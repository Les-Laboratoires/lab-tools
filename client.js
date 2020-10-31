const Discord = require("discord.js")
const path = require("path")

const utils = require("./utils")

const client = new Discord.Client()

client.prefix = "!"

/**
 * @typedef Command
 * @param {module:"discord.js".Message} message
 * @property {string} name
 * @property {string} description
 * @property {string[]} aliases
 */

/**
 * @type {module:"discord.js".Collection<string, Command>}
 */
client.commands = new Discord.Collection()

utils
  .forFiles([path.join(__dirname, "commands")], function (filePath) {
    const cmd = require(filePath)
    client.commands.set(cmd.name, cmd)
  })
  .catch(console.error)

utils
  .forFiles([path.join(__dirname, "listeners")], function (filePath) {
    const listener = require(filePath)
    client[listener.once ? "once" : "on"](listener.name, listener)
  })
  .catch(console.error)

/**
 * @param {string} text
 * @return {Command}
 */
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
