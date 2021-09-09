import * as app from "../app.js"

import busy from "../tables/busy.js"

export default new app.Command({
  name: "toggle",
  channelType: "guild",
  description: "Toggle a busy-mark on a help-room",
  coolDown: 5000,
  middlewares: [app.isInHelpRoom()],
  positional: [
    {
      name: "user",
      castValue: "user",
      description: "User who occupies room",
      default: (message) => message?.author.id ?? "",
    },
  ],
  async run(message) {
    message.delete().catch()

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
          const { result: error } = await app.staffOnly()(message, null)
          if (error !== true)
            return channel.send({
              embeds: [
                new app.MessageEmbed()
                  .setColor("RED")
                  .setDescription(error || "Staff only command."),
              ],
            })
        }
      }

      message.triggerCoolDown()

      await busy.query.delete().where("channel_id", channel.id)

      await channel.setName(name.replace("⛔", ""))

      return message.sendTimeout(10000, {
        embeds: [
          new app.MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(
              `${app.emote(message, "CHECK")} This help room is now **free**.`
            ),
        ],
      })
    } else {
      message.triggerCoolDown()

      await busy.query.insert({
        user_id: user.id,
        channel_id: channel.id,
      })

      await channel.setName(name + "⛔")

      return message.sendTimeout(10000, {
        embeds: [
          new app.MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(
              `${app.emote(
                message,
                "CHECK"
              )} This help room is now **occupied**${
                user ? ` by ${user.username}` : ""
              }.`
            )
            .setFooter(
              `${user.tag} should use the ${message.usedPrefix}toggle command to free the help room once its problem has been resolved.`
            ),
        ],
      })
    }
  },
  subs: [
    new app.Command({
      name: "check",
      description: "Check who occupies room",
      aliases: ["who", "show"],
      coolDown: 10000,
      channelType: "guild",
      middlewares: [app.isInHelpRoom()],
      async run(message) {
        message.delete().catch()

        const { channel } = message
        const { name } = channel

        if (name.endsWith("⛔")) {
          message.triggerCoolDown()

          const busyItem = await busy.query
            .select()
            .where("channel_id", channel.id)
            .first()

          if (busyItem) {
            const user = await message.client.users.fetch(busyItem.user_id)

            return message.sendTimeout(10000, {
              embeds: [
                new app.MessageEmbed()
                  .setColor("BLURPLE")
                  .setAuthor(
                    `This help room is currently occupied by ${user.username}`,
                    user.displayAvatarURL({ dynamic: true })
                  )
                  .setFooter(
                    `${user.tag} should use the ${message.usedPrefix}toggle command to free the help room once its problem has been resolved.`
                  ),
              ],
            })
          } else {
            await channel.setName(name.replace("⛔", ""))

            return message.sendTimeout(10000, {
              embeds: [
                new app.MessageEmbed()
                  .setColor("BLURPLE")
                  .setTitle("This help room is free"),
              ],
            })
          }
        } else
          return message.sendTimeout(10000, {
            embeds: [
              new app.MessageEmbed()
                .setColor("BLURPLE")
                .setTitle("This help room is free"),
            ],
          })
      },
    }),
  ],
})
