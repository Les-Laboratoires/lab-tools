import * as app from "../app"

import busy from "../tables/busy"

module.exports = new app.Command({
  name: "toggle",
  channelType: "guild",
  description: "Toggle a busy-mark on a help-room",
  coolDown: 5000,
  middlewares: [
    (message) =>
      message.channel.name.includes("help-room") ||
      "You must be in a help room.",
  ],
  positional: [
    {
      name: "user",
      castValue: "user",
      description: "User who occupies room",
      default: (message) => message?.author.id ?? "",
    },
  ],
  async run(message) {
    const user: app.User = message.args.user
    const { channel } = message
    const { name } = channel

    if (name.endsWith("⛔")) {
      const busyItem = await busy.query
        .select()
        .where("channel_id", channel.id)
        .first()

      if (busyItem) {
        if (busyItem.user_id !== message.author.id) {
          const error = await app.staffOnly(message)
          if (error !== true)
            return channel.send(
              new app.MessageEmbed().setColor("RED").setDescription(error)
            )
        }
      }

      await busy.query.delete().where("channel_id", channel.id)

      await channel.setName(name.replace("⛔", ""))

      return channel.send(
        new app.MessageEmbed()
          .setColor("BLURPLE")
          .setDescription(`⛔ This help room is now **free**.`)
      )
    } else {
      await busy.query.insert({
        user_id: user.id,
        channel_id: channel.id,
      })

      await channel.setName(name + "⛔")

      return channel.send(
        new app.MessageEmbed()
          .setColor("BLURPLE")
          .setDescription(
            `⛔ This help room is now **busy**${
              user ? ` by ${user.username}` : ""
            }.`
          )
          .setFooter(
            `Please use the ${message.usedPrefix}toggle command to free the channel when your fix is done.`
          )
      )
    }
  },
})
