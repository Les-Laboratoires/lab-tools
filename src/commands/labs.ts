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
          required: true,
        },
      ],
      options: [
        {
          name: "id",
          description: "The guild id",
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
          return message.send(
            `${app.emote(message, "DENY")} Incorrect guild id`
          )

        await lab.query
          .insert({
            guild_id: guild._id,
            url: message.args.url,
            title: message.args.title,
          })
          .onConflict("guild_id")
          .merge()

        return message.send(
          `${app.emote(message, "CHECK")} Successfully added **${
            message.args.id
              ? message.client.guilds.cache.get(message.args.id)?.name
              : message.guild.name
          }**`
        )
      },
    }),
    new app.Command({
      name: "update",
      aliases: ["refresh"],
      description: "Update all affiliations",
      channelType: "guild",
      botOwnerOnly: true,
      coolDown: 10000,
      async run(message) {
        await app.updateLabsInAffiliationChannels(message)

        message.triggerCoolDown()
      },
    }),
    new app.Command({
      name: "list",
      aliases: ["all"],
      description: "List all labs",
      channelType: "guild",
      async run(message) {
        await app.sendLabList(message.channel)
      },
    }),
  ],
})
