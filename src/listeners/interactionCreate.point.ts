import * as app from "../app.js"

import points from "../tables/point.js"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "Handle points given for help quality",
  async run(interaction) {
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith("point")) return

    const [_, amount, from_id] = interaction.customId.split(";")

    if (from_id !== interaction.user.id) return

    const fromUser = await app.getUser(interaction.user, true)
    const toUser = await app.getUser(interaction.message.author, true)

    await points.query.insert({
      from_id: fromUser._id,
      to_id: toUser._id,
      amount: +amount,
    })

    await interaction.reply({
      content: `${app.emote(interaction, "CHECK")} Successfully noted.`,
      ephemeral: true,
    })

    if (interaction.message instanceof app.Message)
      await interaction.message.delete?.()

    await app.sendLog(
      interaction.guild!,
      `${interaction.user} give ${amount} points to ${interaction.message.author} in ${interaction.channel}.`
    )
  },
}

export default listener
