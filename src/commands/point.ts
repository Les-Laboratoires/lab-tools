import * as app from "#app"

import points from "#tables/point.ts"

export default new app.Command({
  name: "point",
  description: "Check your points",
  channelType: "guild",
  aliases: ["points", "pts", "score"],
  async run(message) {
    const user = await app.getUser(message.member, true)

    const data = (await points.query
      .select(app.database.raw("sum(amount) as total"))
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
  subs: [app.pointLadder.generateCommand()],
})
