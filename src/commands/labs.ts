import * as app from "../app"

import lab from "../tables/lab"

module.exports = new app.Command({
  name: "labs",
  aliases: ["lab", "affiliations", "affiliation"],
  coolDown: 10000,
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
        await lab.query
          .insert({
            id: message.args.id,
            url: message.args.url,
            title: message.args.title,
          })
          .onConflict(["id", "url"])
          .merge()

        const labs = await lab.query.select()

        const pages = app.Paginator.divider(labs, 6)

        for (const guild of message.client.guilds.cache.array()) {
          const config = await app.getConfig(guild)

          if (config?.affiliation_channel_id) {
            const channel = guild.channels.cache.get(
              config.affiliation_channel_id
            )

            if (channel?.isText()) {
              const messages = await channel.messages.fetch()

              for (const m of messages.array()) await m.delete()

              for (const page of pages) {
                await channel.send(
                  page.map((lab) => `${lab.title} ${lab.url}`).join("\n")
                )
              }

              await message.send(
                `${app.emote(
                  message,
                  "CHECK"
                )} Updated **${guild}** affiliations`
              )
            }
          }
        }

        message.triggerCoolDown()

        return message.send(
          `${app.emote(
            message,
            "CHECK"
          )} Successfully updated all affiliations.`
        )
      },
    }),
  ],
})
