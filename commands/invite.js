const Discord = require("discord.js")

module.exports = async function invite(message) {
  let here = true,
    bot

  if (message.content.startsWith("--here")) {
    message.content = message.content.replace("--here", "").trim()
    here = true
  } else if (message.content.startsWith("--no-here")) {
    message.content = message.content.replace("--no-here", "").trim()
    here = false
  }

  if (message.mentions.members.size > 0) {
    bot = message.mentions.members.first().user
    here = false
  } else if (/^\d+$/.test(message.content)) {
    bot = await message.client.users.fetch(message.content, false, true)
    here = true
  }

  if (!bot) {
    return message.channel.send(
      "Tu dois donner un identifiant valide ou mentionner un bot !"
    )
  }

  let url = "https://discord.com/oauth2/authorize?scope=bot&client_id=" + bot.id

  if (here) {
    url += "&permissions=0&guild_id=" + message.guild.id
  } else {
    url += "&permissions=2146958847"
  }

  await message.channel.send(
    new Discord.MessageEmbed()
      .setAuthor(
        `Invitez ${bot.username} ${here ? "ici" : ""}`,
        message.guild.iconURL({ dynamic: true }),
        url
      )
      .setImage(bot.displayAvatarURL({ dynamic: true }))
      .setFooter(url)
  )
}

module.exports.aliases = ["invitation", "bot", "cobaye"]
