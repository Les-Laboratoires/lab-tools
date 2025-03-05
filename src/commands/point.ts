import { EmbedBuilder } from "discord.js"

import database from "#core/database"
import { Command } from "#core/index"

import { pointLadder } from "#namespaces/point"
import { getUser, prefix } from "#namespaces/tools"

import points from "#tables/point"

export default new Command({
  name: "point",
  description: "Check your points",
  channelType: "guild",
  aliases: ["points", "pts", "score"],
  async run(message) {
    const user = await getUser(message.member, true)

    const data = (await points.query
      .select(database.raw("sum(amount) as total"))
      .where("to_id", user._id)
      .first()) as { total: number } | undefined

    await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Points de ${message.member.displayName}`)
          .setDescription(
            `Vous avez actuellement ${
              data?.total ?? 0
            } points. Vous pouvez en gagner en aidant les autres membres et en utilisant la commande \`${await prefix(
              message.guild,
            )}point ask @membre\`.`,
          ),
      ],
    })
  },
  subs: [pointLadder.generateCommand()],
})
