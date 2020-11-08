const Discord = require("discord.js")

module.exports = async function channelCreate(channel) {
  if (channel instanceof Discord.TextChannel) {
    await channel.send(
      "Stop créer des chan pour rien Nono <:derp:749360539943174194>"
    )
  }
}
