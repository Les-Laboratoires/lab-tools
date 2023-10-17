import * as app from "../app.js"

import points from "../tables/point.js"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "Handle points given for help quality",
  async run(interaction) {
    if (!app.cache.ensure<boolean>("turn", true)) return
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith("point")) return

    const [_, amount, from_id, to_id] = interaction.customId.split(";")

    if (from_id !== interaction.user.id) return

    if (from_id === to_id)
      return await interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY"
        )} You can't give points to yourself.`,
        ephemeral: true,
      })

    const fromUser = await app.getUser({ id: from_id }, true)
    const toUser = await app.getUser({ id: to_id }, true)

    await points.query.insert({
      from_id: fromUser._id,
      to_id: toUser._id,
      amount: +amount,
      created_at: new Date().toISOString(),
    })

    await interaction.reply({
      content: `${app.emote(interaction, "CHECK")} Successfully noted.`,
      ephemeral: true,
    })

    if (interaction.message instanceof app.Message)
      await interaction.message.delete?.()

    await app.sendLog(
      interaction.guild!,
      `${interaction.user} give **${amount}** points to <@${to_id}> in ${interaction.channel}.`
    )
  },
}

export default listener
