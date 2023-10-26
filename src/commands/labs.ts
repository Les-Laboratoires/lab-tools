import * as app from "../app.js"

import lab from "../tables/lab.js"

export default new app.Command({
  name: "labs",
  aliases: ["lab", "affiliations", "affiliation"],
  description: "The labs command",
  channelType: "guild",
  async run(message) {
    return app.sendCommandDetails(message, this)
  },
  subs: [
    new app.Command({
      name: "add",
      aliases: ["set"],
      description: "Add a lab",
      channelType: "guild",
      botOwnerOnly: true,
      positional: [
        {
          name: "url",
          description: "Lab invite url",
          type: "string",
          required: true,
        },
      ],
      options: [
        {
          name: "id",
          description: "The guild id",
          type: "string",
        },
      ],
      rest: {
        name: "title",
        description: "The displayed text",
        required: true,
      },
      async run(message) {
        const guild = message.args.id
          ? await app.getGuild({ id: message.args.id })
          : await app.getGuild(message.guild, true)

        if (!guild)
          return message.channel.send(
            `${app.emote(message, "DENY")} Incorrect guild id`,
          )

        await lab.query
          .insert({
            guild_id: guild._id,
            url: message.args.url,
            title: message.args.title,
          })
          .onConflict("guild_id")
          .merge()

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully added **${
            message.args.id
              ? message.client.guilds.cache.get(message.args.id)?.name
              : message.guild.name
          }**`,
        )
      },
    }),
    new app.Command({
      name: "update",
      aliases: ["refresh"],
      description: "Update all affiliations",
      channelType: "guild",
      botOwnerOnly: true,
      cooldown: {
        duration: 10000,
        type: app.CooldownType.Global,
      },
      positional: [
        app.positional({
          name: "packSize",
          description: "How many labs to send per message",
          type: "number",
          validate: (value) => value > 0 && value <= 12,
          default: 10,
        }),
      ],
      async run(message) {
        await app.updateLabsInAffiliationChannels(
          message,
          message.args.packSize,
        )

        message.triggerCoolDown()
      },
    }),
    new app.Command({
      name: "list",
      aliases: ["all"],
      description: "List all labs",
      channelType: "guild",
      positional: [
        {
          name: "packSize",
          description: "How many labs to send per message",
          type: "number",
          validate: (value: number) => value > 0 && value <= 12,
          default: "10",
        },
      ],
      async run(message) {
        await app.sendLabList(message.channel, message.args.packSize)
      },
    }),
  ],
})
