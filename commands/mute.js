const utils = require("../utils")

module.exports = async function mute(message) {
  if (
    !message.member.permissions.has("ADMINISTRATOR", true) &&
    !message.member.roles.cache.has(utils.modo)
  ) {
    return message.channel.send("T'es pas modo mon salaud!")
  }

  const target = await utils.resolveMember(message)

  if (target === message.member) {
    return message.channel.send(
      "C'est un peu con de s'auto-mute quand même non ?"
    )
  }

  const muted = message.client.db.get("muted")

  if (muted.includes(target.id)) {
    message.client.db.remove("muted", target.id)
    await message.channel.send(`Ok, ${target.user.username} n'est plus muted.`)
  } else {
    message.client.db.push("muted", target.id)
    await message.channel.send(`Ok, ${target.user.username} est muted.`)
  }
}
