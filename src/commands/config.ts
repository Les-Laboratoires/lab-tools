import * as app from "../app"

import guilds from "../tables/guilds"

module.exports = new app.Command({
  name: "config",
  description: "Display guild configs",
  channelType: "guild",
  async run(message) {
    return message.channel.send(
      new app.MessageEmbed()
        .setAuthor(
          `${message.guild.name} | Configs`,
          message.guild.iconURL({ dynamic: true }) ?? undefined
        )
        .setDescription(
          app.code.stringify({
            lang: "json",
            content: JSON.stringify(
              await guilds.query.select().where("id", message.guild.id).first(),
              null,
              2
            ),
          })
        )
    )
  },
  subs: [
    new app.Command({
      name: "set",
      channelType: "guild",
      guildOwnerOnly: true,
      description: "Set guild config",
      positional: [
        {
          name: "name",
          required: true,
          description: "The name of edited property",
        },
        {
          name: "value",
          required: true,
          description: "The value of edited property",
        },
      ],
      async run(message) {
        if (!app.isGuildMessage(message)) return

        await guilds.query
          .update({
            [message.args.name]: message.args.value,
          })
          .where("id", message.guild.id)

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully updated \`${message.args.name}\` value. `
        )
      },
    }),
  ],
})
