import * as app from "../app"

const command: app.Command = {
  name: "custom",
  aliases: ["cc", "cmd", "command"],
  async run(message) {
    return message.channel.send(
      "En vrai je sais pas ce que tu veux <:harold:556967769304727564>"
    )
  },
  subs: [
    {
      name: "set",
      aliases: ["add"],
      staffOnly: true,
      args: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const name = message.args.name

        if (!message.content)
          return message.channel.send("Il manque le contenu de ta commande...")

        if (app.commands.resolve(name))
          return message.channel.send(
            "Cette commande existe déjà <:notLikeThis:507420569482952704>"
          )

        app.customCommands.set(name, message.rest)

        return message.channel.send(
          `La commande \`!${name}\` à été créée <:yay:557124850326437888>`
        )
      },
    },
    {
      name: "remove",
      aliases: ["delete", "rm", "del"],
      staffOnly: true,
      args: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const { name } = message.args

        if (!app.customCommands.has(name))
          return message.channel.send(
            "Cette commande n'existe pas <:derp:749360539943174194>"
          )

        app.customCommands.delete(name)

        return message.channel.send(
          `Ok j'ai effacé la commande \`!${name}\` <:pepeOK:689790261429272596>`
        )
      },
    },
  ],
}

module.exports = command
