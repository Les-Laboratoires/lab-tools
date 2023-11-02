import * as app from "../app.js"

import points from "../tables/point.js"

export default new app.Command({
  name: "point",
  description: "Check your points",
  channelType: "guild",
  aliases: ["points", "pts", "score"],
  async run(message) {
    const user = await app.getUser(message.member, true)

    const data = (await points.query
      .select(app.orm.raw("sum(amount) as total"))
      .where("to_id", user._id)
      .first()) as { total: number } | undefined

    await message.channel.send({
      embeds: [
        new app.EmbedBuilder()
          .setTitle(`Points de ${message.member.displayName}`)
          .setDescription(
            `Vous avez actuellement ${
              data?.total ?? 0
            } points. Vous pouvez en gagner en aidant les autres membres et en utilisant la commande \`${await app.prefix(
              message.guild,
            )}point ask @membre\`.`,
          ),
      ],
    })
  },
  subs: [
    app.pointLadder.generateCommand(),
    new app.Command({
      name: "ask",
      channelType: "guild",
      description: "Send a message for asking points",
      positional: [
        app.positional({
          name: "member",
          description: "The member you want to ask points",
          required: true,
          type: "member",
          validate: (value, message) => value.id !== message?.member?.id,
          validationErrorMessage: "You can't ask points to yourself.",
        }),
      ],
      async run(message) {
        await message.delete()

        await message.channel.send(
          await app.buildAskPointEmbed(
            message.author,
            message.args.member!,
            message.guild,
          ),
        )

        await app.sendLog(
          message.guild,
          `${message.author} ask points to ${message.args.member} in ${message.channel}.`,
        )
      },
    }),
  ],
})
