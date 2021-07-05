import * as app from "../app"

import guilds, { GuildConfig } from "../tables/guilds"

module.exports = new app.Command({
  name: "config",
  description: "Display guild configs",
  guildOwnerOnly: true,
  channelType: "guild",
  async run(message) {
    let config: Partial<GuildConfig> | undefined = await app.getConfig(
      message.guild
    )

    if (!config) {
      config = {
        id: message.guild.id,
      }

      await guilds.query.insert(config)
    }

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
              await app.getConfig(message.guild),
              null,
              2
            ),
          })
        )
    )
  },
  subs: [
    new app.Command({
      name: "overwrite",
      aliases: ["ow", "new"],
      channelType: "guild",
      description: "Overwrite guild config",
      guildOwnerOnly: true,
      rest: {
        name: "config",
        description: "New guild config",
        required: true,
        all: true,
      },
      async run(message) {
        const config = JSON.parse(message.args.config)

        await guilds.query.delete().where("id", message.guild.id)
        await guilds.query.insert({ ...config, id: message.guild.id })

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully updated \`${message.args.name}\` value. `
        )
      },
    }),
    new app.Command({
      name: "merge",
      aliases: ["ow", "new"],
      channelType: "guild",
      description: "Overwrite guild config",
      guildOwnerOnly: true,
      rest: {
        name: "config",
        description: "New guild config",
        required: true,
        all: true,
      },
      async run(message) {
        const config = JSON.parse(message.args.config)

        await guilds.query
          .insert({ ...config, id: message.guild.id })
          .onConflict("id")
          .merge()

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully updated \`${message.args.name}\` value. `
        )
      },
    }),
    new app.Command({
      name: "set",
      channelType: "guild",
      guildOwnerOnly: true,
      description: "Set guild config",
      rest: {
        name: "value",
        required: true,
        description: "The value of edited property",
      },
      positional: [
        {
          name: "name",
          required: true,
          description: "The name of edited property",
        },
      ],
      async run(message) {
        if (message.args.name === "id")
          return message.send(
            `${app.emote(message, "DENY")} You can't edit the guild id!`
          )

        await guilds.query
          .insert({
            id: message.guild.id,
            [message.args.name]: message.rest.trim(),
          })
          .onConflict("id")
          .merge()

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully updated \`${message.args.name}\` value. `
        )
      },
    }),
    new app.Command({
      name: "reset",
      channelType: "guild",
      description: "Reset guild config",
      guildOwnerOnly: true,
      async run(message) {
        await guilds.query.delete().where("id", message.guild.id)

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully reset guild config.`
        )
      },
    }),
  ],
})
