const Discord = require("discord.js")
const utils = require("../utils")
const client = require("../client")

async function message(m) {
  // checks
  if (m.system || m.author.bot) return
  if (!(m.channel instanceof Discord.TextChannel)) return

  // delete muted messages
  if (this.db.get("muted").includes(m.author.id)) {
    return m.delete()
  }

  // presentations checks
  if (m.channel.id === utils.presentations) {
    if (
      m.member.roles.cache.has(utils.scientifique) ||
      m.member.roles.cache.has(utils.validation)
    )
      return
    await m.member.roles.add(utils.validation)
    return m.react(utils.approved).catch(console.error)
  }

  // prefix checks
  if (m.content.startsWith(client.prefix)) {
    m.content = m.content.slice(client.prefix.length)
  } else {
    return
  }

  // handle command
  const key = m.content.split(/\s+/)[0]
  const command = client.findCommand(key)

  // run command
  if (command) {
    m.content = m.content.slice(key.length).trim()
    try {
      await command.bind(this)(m)
    } catch (error) {
      m.channel
        .send(
          utils.code(
            `Error: ${error.message?.replace(/\x1b\[\d+m/g, "") ?? "unknown"}`,
            "js"
          )
        )
        .catch(console.error)
    }
  }
}

module.exports = message
