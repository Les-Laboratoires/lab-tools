import * as app from "#app"

export default new app.SlashCommand({
  name: "resolve",
  description: "Mark as resolved a topic",
  channelType: "thread",
  async run(interaction) {
    const topic = interaction.channel
    const forum = topic.parent

    if (!interaction.guild)
      return interaction.reply({
        content: `${app.emote(interaction, "Cross")} Only usable in a guild.`,
        ephemeral: true,
      })

    if (!forum || !forum.isThreadOnly())
      return interaction.reply({
        content: `${app.emote(interaction, "Cross")} Only usable in a forum topic.`,
        ephemeral: true,
      })

    const { resolved_channel_indicator, resolved_channel_tag } =
      await app.getGuild(interaction.guild, true)

    if (topic.name.startsWith(resolved_channel_indicator))
      return interaction.reply({
        content: `${app.emote(interaction, "Cross")} Topic is already resolved.`,
        ephemeral: true,
      })

    await topic.setName(`${resolved_channel_indicator} ${topic.name}`)

    if (resolved_channel_tag) await topic.setAppliedTags([resolved_channel_tag])

    return interaction.reply({
      content: `${app.emote(interaction, "CheckMark")} Thread marked as resolved.`,
      ephemeral: true,
    })
  },
})
