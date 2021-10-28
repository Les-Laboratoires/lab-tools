import * as app from "../app.js"

import guilds, { GuildConfig } from "../tables/guilds.js"

export default new app.Command({
  name: "config",
  description: "Display guild configs",
  guildOwnerOnly: true,
  channelType: "guild",
  flags: [
    {
      name: "raw",
      description: "Get data as json",
      flag: "r",
      aliases: ["json"],
    },
  ],
  async run(message) {
    const config = await app.getConfig(message.guild, true)

    return message.channel.send({
      embeds: [
        new app.MessageEmbed()
          .setAuthor(
            `${message.guild.name} | Configs`,
            message.guild.iconURL({ dynamic: true }) ?? undefined
          )
          .setDescription(
            message.args.raw
              ? app.code.stringify({
                  lang: "json",
                  content: JSON.stringify(config, null, 2),
                })
              : Object.entries(config)
                  .map(([key, value]) => {
                    let entity: any

                    if (value === null) entity = "`null`"
                    else if (key.includes("channel_id")) entity = `<#${value}>`
                    else if (key.includes("role_id")) entity = `<@&${value}>`
                    else if (/(user|member)_id/.test(key))
                      entity = `<@${value}>`
                    else if (key.includes("emoji_id"))
                      entity = message.client.emojis.cache.get(value)
                    else entity = `"${value}"`

                    return `${key} = ${entity}`
                  })
                  .join("\n")
          ),
      ],
    })
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
          `${app.emote(message, "CHECK")} Successfully overwritten config. `
        )
      },
    }),
    new app.Command({
      name: "merge",
      aliases: ["mix"],
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
          `${app.emote(message, "CHECK")} Successfully merged values. `
        )
      },
    }),
    new app.Command({
      name: "set",
      channelType: "guild",
      guildOwnerOnly: true,
      description: "Set guild config property",
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
          `${app.emote(message, "CHECK")} Successfully updated \`${
            message.args.name
          }\` value. `
        )
      },
    }),
    new app.Command({
      name: "get",
      channelType: "guild",
      guildOwnerOnly: true,
      description: "Get guild config value",
      positional: [
        {
          name: "name",
          required: true,
          description: "The name of edited property",
        },
      ],
      async run(message) {
        const config = await app.getConfig(message.guild)

        if (!config)
          return message.send({
            embeds: [
              new app.MessageEmbed()
                .setColor("BLURPLE")
                .setTitle(`${message.guild.name} - ${message.args.name}`)
                .setDescription(app.code.stringify({ content: "null" })),
            ],
          })

        const value = config[message.args.name as keyof GuildConfig] ?? "null"

        let json: object | null = null
        try {
          json = JSON.parse(value)
        } catch (error) {}

        return message.channel.send({
          embeds: [
            new app.MessageEmbed()
              .setColor("BLURPLE")
              .setTitle(`${message.guild.name} - ${message.args.name}`)
              .setDescription(
                app.code.stringify({
                  content:
                    json !== null ? JSON.stringify(json, null, 2) : value,
                  lang: json !== null ? "json" : undefined,
                })
              ),
          ],
        })
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
          `${app.emote(message, "CHECK")} Successfully reset guild config.`
        )
      },
    }),
    new app.Command({
      name: "add",
      botOwnerOnly: true,
      channelType: "all",
      description: "Add entry to deployed config table",
      positional: [
        {
          name: "name",
          description: "The name of new property",
          required: true,
          checkValue: /^\w+$/,
        },
      ],
      async run(message) {
        await app.db.schema.alterTable("guilds", (table) => {
          table.string(message.args.name)
        })

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully added guild config.`
        )
      },
    }),
  ],
})
