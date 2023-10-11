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
      aliases: ["update", "set"],
      description: "Add a lab",
      channelType: "guild",
      coolDown: 10000,
      botOwnerOnly: true,
      rest: {
        name: "title",
        description: "The displayed text",
        required: true,
      },
      positional: [
        {
          name: "id",
          description: "Lab id",
          required: true,
        },
        {
          name: "url",
          description: "Lab invite url",
          required: true,
        },
      ],
      async run(message) {
        const guild = await app.getGuild(message.guild, true)

        await lab.query
          .insert({
            guild_id: guild._id,
            url: message.args.url,
            title: message.args.title,
          })
          .onConflict("id")
          .merge()

        //await app.updateLabsInAffiliationChannels(message)

        message.triggerCoolDown()
      },
    }),
  ],
})
