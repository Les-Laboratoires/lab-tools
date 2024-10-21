import * as app from "#app"

import points from "#tables/point.ts"
import helping from "#tables/helping.ts"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "Handle points given for help quality",
  async run(interaction) {
    if (!app.cache.ensure<boolean>("turn", true)) return
    if (!interaction.guild) return
    if (!interaction.isButton()) return
    if (!interaction.channel?.isThread()) return
    if (!interaction.customId.startsWith("point")) return

    await interaction.deferReply({ ephemeral: true })

    const guild = await app.getGuild(interaction.guild, { forceExists: true })

    if (!guild.help_forum_channel_id) return
    if (interaction.channel.parentId !== guild.help_forum_channel_id) return

    const [, amount, from_id, to_id] = interaction.customId.split(";")

    if (from_id !== interaction.user.id)
      return await interaction.editReply({
        content: `${app.emote(
          interaction,
          "Cross",
        )} This button is not for you.`,
      })

    if (from_id === to_id)
      return await interaction.editReply({
        content: `${app.emote(
          interaction,
          "Cross",
        )} You can't give points to yourself.`,
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
      interaction.guild,
      `${interaction.user} gave **${amount}** points to <@${to_id}> in ${interaction.channel}.`,
    )

    await interaction.editReply({
      content: `${app.emote(interaction, "CheckMark")} Successfully rated.`,
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

    const state = await helping.query
      .where("id", interaction.channel.id)
      .first()

    await helping.query.where("id", interaction.channel.id).update({
      rewarded_helper_ids:
        state && state.rewarded_helper_ids !== ""
          ? [...state.rewarded_helper_ids.split(";"), to_id].join(";")
          : to_id,
    })

    await app.refreshHelpingFooter(interaction.channel)
  },
}

export default listener
