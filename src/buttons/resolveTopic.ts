import * as app from "#app"
import helping from "#tables/helping.ts"

export default new app.Button({
  key: "resolveTopic",
  description: "Mark the topic as resolved",
  guildOnly: true,
  builder: (builder) =>
    builder.setLabel("Résolu").setStyle(app.ButtonStyle.Success).setEmoji("✅"),
  async run(interaction) {
    if (!interaction.channel?.isThread()) return

    await interaction.deferReply({ ephemeral: true })

    const topic = interaction.channel
    const forum = topic.parent
    const guild = await app.getGuild(interaction.guild!, { forceExists: true })

    if (!forum || forum.id !== guild.help_forum_channel_id)
      return interaction.editReply({
        content: `${app.emote(topic, "Cross")} Only usable in a forum topic.`,
      })

    if (
      !interaction.member ||
      (interaction.member.user.id !== topic.ownerId &&
        !interaction.memberPermissions?.has("ManageThreads"))
    )
      return interaction.editReply({
        content: `${app.emote(topic, "Cross")} You must be the owner of the topic or have the \`ManageThreads\` permission to resolve it.`,
      })

    const { resolved_channel_indicator, resolved_channel_tag } =
      await app.getGuild(interaction.guild!, { forceExists: true })

    if (topic.name.startsWith(resolved_channel_indicator))
      return interaction.editReply({
        content: `${app.emote(topic, "Cross")} Topic is already resolved.`,
      })

    await topic.setName(`${resolved_channel_indicator} ${topic.name} [RÉSOLU]`)

    if (resolved_channel_tag) {
      try {
        await topic.setAppliedTags([resolved_channel_tag])
      } catch {}
    }

    await interaction.editReply({
      content: `${app.emote(topic, "CheckMark")} Thread marked as resolved.`,
    })

    await helping.query
      .insert({
        id: topic.id,
        resolved: true,
      })
      .onConflict("id")
      .merge(["resolved"])

    await app.refreshHelpingFooter(topic)
  },
})
