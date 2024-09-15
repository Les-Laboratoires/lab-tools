import * as app from "#app"

import rating from "#tables/rating.ts"

export default new app.Command({
  name: "rating",
  aliases: ["note", "rate"],
  description: "Rate a user or a bot",
  channelType: "guild",
  positional: [
    app.positional({
      name: "member",
      description: "The rated member",
      type: "member",
      validate: (value, message) => {
        return (
          (value !== message.member && !!value) || "You can't target yourself."
        )
      },
    }),
    app.positional({
      name: "rating",
      description: "Rating from 0 to 5",
      type: "number",
      validate: (rating) =>
        rating >= 0 && rating <= 5 && Number.isInteger(rating),
    }),
  ],
  async run(message) {
    if (message.args.member) {
      if (message.args.rating !== null) {
        const value = message.args.rating as 0 | 1 | 2 | 3 | 4 | 5

        const fromUser = await app.getUser(message.author, true)
        const toUser = await app.getUser(message.args.member, true)
        const guild = await app.getGuild(message.guild, { forceExists: true })

        const pack = {
          guild_id: guild._id,
          from_id: fromUser._id,
          to_id: toUser._id,
        }

        if (await rating.query.where(pack).first()) {
          await rating.query.update({ value }).where(pack)
        } else {
          await rating.query.insert({ value, ...pack })
        }

        return message.channel.send(
          `${app.emote(message, "CheckMark")} Successfully rated.`,
        )
      }

      return message.channel.send({
        embeds: [await app.ratingEmbed(message.args.member)],
      })
    }

    return message.channel.send({
      embeds: [await app.ratingEmbed(message.member)],
    })
  },
  subs: [
    new app.Command({
      name: "leaderboard",
      description: `Show the leaderboard of Rating`,
      channelType: "guild",
      aliases: ["ladder", "lb", "top", "rank"],
      options: [
        app.option({
          name: "lines",
          description: "Number of lines to show per page",
          type: "number",
          default: 15,
          aliases: ["line", "count"],
          validate: (value) => value > 0 && value <= 50,
        }),
      ],
      flags: [
        app.flag({
          name: "global",
          flag: "g",
          description: "Show the global leaderboard of Rating",
        }),
      ],
      run: async (message) => {
        const guild = message.args.global
          ? undefined
          : await app.getGuild(message.guild, { forceExists: true })

        app.ratingLadder(guild?._id).send(message.channel, {
          pageLineCount: message.args.lines,
        })
      },
    }),
  ],
})
