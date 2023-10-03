import * as app from "../app.js"

import guilds, { Guild } from "../tables/guild.js"

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
    const config = await app.getGuild(message.guild, true)

    const specialProps: app.MessageEmbed[] = []

    await message.channel.send({
      embeds: [
        new app.MessageEmbed()
          .setAuthor({
            name: `${message.guild.name} | Configs`,
            iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
          })
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
                    else if (
                      value.split("\n").length > 1 ||
                      (app.isJSON(value) &&
                        !/^\d+$/.test(value) &&
                        value.length > 50)
                    ) {
                      const isJSON = app.isJSON(value)

                      specialProps.push(
                        new app.MessageEmbed().setTitle(key).setDescription(
                          app.code.stringify({
                            lang: isJSON ? "json" : undefined,
                            format: isJSON ? { printWidth: 62 } : undefined,
                            content: value,
                          })
                        )
                      )

                      return null
                    } else entity = `"${value}"`

                    return `**${key}** = ${entity}`
                  })
                  .filter((line) => line !== null)
                  .join("\n")
          ),
      ],
    })

    if (specialProps.length > 0)
      return message.channel.send({ embeds: specialProps })
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

        delete config._id

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
        if (message.args.name === "id" || message.args.name === "_id")
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
        const config = await app.getGuild(message.guild)

        if (!config)
          return message.send({
            embeds: [
              new app.MessageEmbed()
                .setColor("BLURPLE")
                .setTitle(`${message.guild.name} - ${message.args.name}`)
                .setDescription(app.code.stringify({ content: "null" })),
            ],
          })

        const value = config[message.args.name as keyof Guild] ?? "null"

        let json: object | null = null
        try {
          if (!/^\d+$/.test(String(value))) json = JSON.parse(String(value))
        } catch (error) {}

        return message.channel.send({
          embeds: [
            new app.MessageEmbed()
              .setColor("BLURPLE")
              .setTitle(`${message.guild.name} - ${message.args.name}`)
              .setDescription(
                app.code.stringify({
                  content:
                    json !== null
                      ? JSON.stringify(json, null, 2)
                      : String(value),
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
  ],
})
