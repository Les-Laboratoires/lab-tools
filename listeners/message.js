const Discord = require("discord.js")
const utils = require("../utils")
const client = require("../client")

module.exports = async function message(message) {
  // checks
  if (message.system || message.author.bot) return
  if (!(message.channel instanceof Discord.TextChannel)) return

  // delete muted messages
  if(message.client.db.get("muted").includes(message.author.id)){
    return message.delete()
  }

  // presentations checks
  if (message.channel.id === utils.presentations) {
    if (
      message.member.roles.cache.has(utils.scientifique) ||
      message.member.roles.cache.has(utils.validation)
    )
      return
    await message.member.roles.add(utils.validation)
    return message.react(utils.approved).catch(console.error)
  }

  // prefix checks
  if (message.content.startsWith(client.prefix)) {
    message.content = message.content.slice(client.prefix.length)
  } else {
    return
  }

  // handle command
  const command = client.findCommand(message.content)

  // run command
  if (command) {
    const alias =
      command.aliases?.find((a) => message.content.startsWith(a)) ||
      command.name
    message.content = message.content.slice(alias.length).trim()
    try {
      await command(message)
    } catch (error) {
      console.error(error)
      message.channel
        .send(utils.code(`Error: ${error.message ?? "unknown"}`, "js"))
        .catch(console.error)
    }
  }
}
