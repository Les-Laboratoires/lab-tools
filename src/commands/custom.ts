import * as app from "../app"

const command: app.Command = {
  name: "custom",
  aliases: ["cc", "cmd", "command"],
  description: "Custom commands",
  async run(message) {
    new app.Paginator(
      app.Paginator.divider(app.customCommands.keyArray(), 10).map((page) =>
        new app.MessageEmbed()
          .setTitle("Custom command list")
          .setDescription(
            app.toCodeBlock(
              page.map((name) => process.env.PREFIX + name).join("\n") ||
                "Nothing."
            )
          )
      ),
      message.channel,
      (reaction, user) => user.id === message.author.id
    )
  },
  subs: [
    {
      name: "set",
      aliases: ["add"],
      staffOnly: true,
      description: "Set custom command",
      positional: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const { name } = message.positional

        if (!message.content)
          return message.channel.send("Il manque le contenu de ta commande...")

        if (app.commands.resolve(name))
          return message.channel.send(
            "Cette commande existe déjà <:notLikeThis:507420569482952704>"
          )

        app.customCommands.set(name, message.rest)

        return message.channel.send(
          `La commande \`${process.env.PREFIX}${name}\` à été créée <:yay:557124850326437888>`
        )
      },
    },
    {
      name: "remove",
      aliases: ["delete", "rm", "del"],
      staffOnly: true,
      description: "Remove custom command",
      positional: [
        {
          name: "name",
          required: true,
        },
      ],
      async run(message) {
        const { name } = message.positional

        if (!app.customCommands.has(name))
          return message.channel.send(
            "Cette commande n'existe pas <:derp:749360539943174194>"
          )

        app.customCommands.delete(name)

        return message.channel.send(
          `Ok j'ai effacé la commande \`${process.env.PREFIX}${name}\` <:pepeOK:689790261429272596>`
        )
      },
    },
  ],
}

module.exports = command
