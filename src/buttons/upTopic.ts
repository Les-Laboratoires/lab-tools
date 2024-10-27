import * as app from "#app"

export default new app.Button({
  key: "upTopic",
  description: "Up the topic in the help forum",
  guildOnly: true,
  cooldown: {
    type: app.CooldownType.ByChannel,
    duration: 1000 * 60 * 60, // 1 hour
  },
  builder: (builder) =>
    builder
      .setLabel("Remonter")
      .setEmoji("🆙")
      .setStyle(app.ButtonStyle.Secondary),
  async run(interaction) {
    if (!interaction.channel?.isThread()) return

    await interaction.deferUpdate()

    const topic = interaction.channel
    const guild = await app.getGuild(interaction.guild!, { forceExists: true })

    if (!guild.help_forum_channel_id) return
    if (topic.parentId !== guild.help_forum_channel_id) return

    interaction.triggerCooldown()

    await interaction.followUp({
      content: `${app.emote(interaction, "CheckMark")} Topic upped.`,
      ephemeral: true,
    })

    await app.refreshHelpingFooter(topic)
  },
})
