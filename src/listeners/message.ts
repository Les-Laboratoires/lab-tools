import * as app from "../app"

const listener: app.Listener<"message"> = {
  event: "message",
  async call(message) {
    if (!app.isCommandMessage(message)) return

    // delete muted messages
    if (app.globals.ensure("muted", []).includes(message.author.id)) {
      return message.delete()
    }

    // presentations checks
    if (message.channel.id === app.presentations) {
      if (
        message.member.roles.cache.has(app.scientifique) ||
        message.member.roles.cache.has(app.validation)
      )
        return
      await message.member.roles.add(app.validation)
      await message.react(app.approved)
      await message.react(app.disapproved)
      return
    }

    const prefix = app.globals.ensure("prefix", process.env.PREFIX)

    if (message.content.startsWith(prefix)) {
      message.content = message.content.slice(prefix.length)
    } else {
      return
    }

    const key = message.content.split(/\s+/)[0]
    let cmd = app.commands.resolve(key)

    if (!cmd) return

    if (cmd.botOwner) {
      if (process.env.OWNER !== message.member.id) {
        return await message.channel.send(
          new app.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              "You must be my owner.",
              message.client.user?.displayAvatarURL()
            )
        )
      }
    }

    if (cmd.guildOwner) {
      if (message.guild.owner !== message.member) {
        return await message.channel.send(
          new app.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              "You must be the guild owner.",
              message.client.user?.displayAvatarURL()
            )
        )
      }
    }

    message.content = message.content.slice(key.length).trim()

    try {
      await cmd.run(message)
    } catch (error) {
      message.channel
        .send(
          app.code(
            `Error: ${error.message?.replace(/\x1b\[\d+m/g, "") ?? "unknown"}`,
            "js"
          )
        )
        .catch(console.error)
    }
  },
}

module.exports = listener