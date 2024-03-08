import * as app from "../app.js"

import rating from "../tables/rating.js"

export default new app.Command({
  name: "rating",
  aliases: ["note", "rate"],
  description: "Rate a user or a bot",
  channelType: "all",
  positional: [
    app.positional({
      name: "user",
      description: "The rated user",
      type: "user",
      validate: (value, message) => {
        return (
          (value !== message.author && value !== undefined) ||
          "You can't target yourself."
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
    if (message.args.user) {
      if (message.args.rating !== null) {
        const value = message.args.rating as 0 | 1 | 2 | 3 | 4 | 5

        const fromUser = await app.getUser(message.author, true)
        const toUser = await app.getUser(message.args.user, true)

        const pack = {
          from_id: fromUser._id,
          to_id: toUser._id,
        }

        if (await rating.query.where(pack).first()) {
          await rating.query.update({ value }).where(pack)
        } else {
          await rating.query.insert({ value, ...pack })
        }

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully rated.`,
        )
      }

      return message.channel.send({
        embeds: [await app.ratingEmbed(message.args.user)],
      })
    }

    return message.channel.send({
      embeds: [await app.ratingEmbed(message.author)],
    })
  },
  subs: [app.ratingLadder.generateCommand()],
})
