import * as app from "../app"

import guilds from "../tables/guilds"

const command: app.Command<app.GuildMessage> = {
  name: "config",
  guildChannelOnly: true,
  description: "Display guild configs",
  async run(message) {
    return message.channel.send(
      new app.MessageEmbed()
        .setAuthor(
          `${message.guild.name} | Configs`,
          message.guild.iconURL({ dynamic: true }) ?? undefined
        )
        .setDescription(
          app.CODE.stringify({
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
    {
      name: "set",
      guildChannelOnly: true,
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
    },
  ],
}

module.exports = command
