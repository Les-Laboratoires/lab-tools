import * as app from "../app"

const command: app.Command = {
  name: "custom",
  aliases: ["cc", "cmd", "command"],
  staffOnly: true,
  async run(message) {
    const key = app.getArgument(message, ["set", "delete"])
    const name = app.getArgument(message)

    if (!name)
      return message.channel.send(
        "Il manque pas mal de choses là <:oof:672056824395988992>"
      )

    switch (key) {
      case "set":
        if (!message.content)
          return message.channel.send("Il manque le contenu de ta commande...")

        if (app.commands.resolve(name))
          return message.channel.send(
            "Cette commande existe déjà <:notLikeThis:507420569482952704>"
          )

        app.customCommands.set(name, message.content)

        return message.channel.send(
          `La commande \`!${name}\` à été créée <:yay:557124850326437888>`
        )
      case "delete":
        if (!app.customCommands.has(name))
          return message.channel.send(
            "Cette commande n'existe pas <:derp:749360539943174194>"
          )

        app.customCommands.delete(name)

        return message.channel.send(
          `Ok j'ai effacé la commande \`!${name}\` <:pepeOK:689790261429272596>`
        )
      default:
        return message.channel.send(
          "En vrai je sais pas ce que tu veux <:harold:556967769304727564>"
        )
    }
  },
}

module.exports = command
