import * as app from "#app"
import points from "#tables/point.ts"
import helping from "#tables/helping.ts"

export type GivePointsButtonParams = [toId: string, amount: number]

export default new app.Button<GivePointsButtonParams>({
  key: "givePoints",
  description: "Gives some helping points to a user",
  guildOnly: true,
  builder: (builder) => builder.setEmoji("👍"),
  async run(interaction, toId, amount) {
    if (!interaction.channel?.isThread()) return

    await interaction.deferReply({ ephemeral: true })

    const guild = await app.getGuild(interaction.guild!, { forceExists: true })

    if (!guild.help_forum_channel_id) return
    if (interaction.channel.parentId !== guild.help_forum_channel_id) return

    const fromId = interaction.user.id

    if (fromId === toId)
      return await interaction.editReply({
        content: `${app.emote(
          interaction,
          "Cross",
        )} You can't give points to yourself.`,
      })

    const fromUser = await app.getUser({ id: fromId }, true)
    const toUser = await app.getUser({ id: toId }, true)

    await points.query.insert({
      from_id: fromUser._id,
      to_id: toUser._id,
      amount: +amount,
      created_at: new Date().toISOString(),
    })

    await app.sendLog(
      interaction.guild!,
      `${interaction.user} gave **${amount}** points to ${app.userMention(toId)} in ${interaction.channel}.`,
    )

    await interaction.editReply({
      content: `${app.emote(interaction, "CheckMark")} Successfully rated.`,
    })

    const target = await interaction.client.users.fetch(toId, {
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
          ? [...state.rewarded_helper_ids.split(";"), toId].join(";")
          : toId,
    })

    await app.refreshHelpingFooter(interaction.channel)
  },
})
