import * as app from "#app"

import points from "#tables/point.ts"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "Handle points given for help quality",
  async run(interaction) {
    if (!app.cache.ensure<boolean>("turn", true)) return
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith("point")) return

    const [, amount, from_id, to_id] = interaction.customId.split(";")

    if (from_id !== interaction.user.id) return

    if (from_id === to_id)
      return await interaction.reply({
        content: `${app.emote(
          interaction,
          "Cross",
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

    await app.sendLog(
      interaction.guild!,
      `${interaction.user} give **${amount}** points to <@${to_id}> in ${interaction.channel}.`,
    )

    await interaction.reply({
      content: `${app.emote(interaction, "CheckMark")} Successfully rated.`,
      ephemeral: true,
    })

    const target = await interaction.client.users.fetch(to_id, {
      cache: false,
      force: true,
    })

    await target.send(
      `${app.emote(
        interaction,
        "CheckMark",
      )} You received **${amount}** points from ${interaction.user} in ${
        interaction.channel
      }.`,
    )

    if (interaction.message instanceof app.Message)
      await interaction.message.delete?.()
  },
}

export default listener
