import * as app from "../app"

const command: app.Command = {
  name: "mute",
  async run(message) {
    if (!app.isMod(message.member)) {
      return message.channel.send("T'es pas modo mon salaud!")
    }

    const target = await app.resolveMember(message)

    if (target === message.member) {
      return message.channel.send("Cible incorrecte...")
    }

    if (app.isMod(target)) {
      return message.channel.send(
        "Ah je suis navré mais non... Fini la guéguerre entre le staff <:oui:703398234718208080>"
      )
    }

    const muted = app.globals.ensure("muted", [])

    if (muted.includes(target.id)) {
      app.globals.remove("muted", target.id as any)
      await message.channel.send(
        `Ok, ${target.user.username} n'est plus muted.`
      )
    } else {
      app.globals.push("muted", target.id)
      await message.channel.send(`Ok, ${target.user.username} est muted.`)
    }
  },
}

module.exports = command
