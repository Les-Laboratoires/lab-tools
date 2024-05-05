import * as app from "#app"

export default new app.SlashCommand({
  name: "resolve",
  description: "Mark as resolved a topic",
  channelType: "thread",
  async run(interaction) {
    const topic = interaction.channel
    const forum = topic.parent

    if (!interaction.guild)
      return interaction.base.reply({
        content: `${app.emote(topic, "Cross")} Only usable in a guild.`,
        ephemeral: true,
      })

    if (!forum || !forum.isThreadOnly())
      return interaction.base.reply({
        content: `${app.emote(topic, "Cross")} Only usable in a forum topic.`,
        ephemeral: true,
      })

    if (
      !interaction.member ||
      (interaction.member.user.id !== topic.ownerId &&
        !interaction.memberPermissions?.has("ManageThreads"))
    )
      return interaction.base.reply({
        content: `${app.emote(topic, "Cross")} You must be the owner of the topic or have the \`ManageThreads\` permission to resolve it.`,
        ephemeral: true,
      })

    const { resolved_channel_indicator, resolved_channel_tag } =
      await app.getGuild(interaction.guild, true)

    if (topic.name.startsWith(resolved_channel_indicator))
      return interaction.base.reply({
        content: `${app.emote(topic, "Cross")} Topic is already resolved.`,
        ephemeral: true,
      })

    await topic.setName(`${resolved_channel_indicator} ${topic.name}`)

    if (resolved_channel_tag) {
      try {
        await topic.setAppliedTags([resolved_channel_tag])
      } catch (err) {}
    }

    return interaction.base.reply({
      content: `${app.emote(topic, "CheckMark")} Thread marked as resolved.`,
      ephemeral: true,
    })
  },
})
