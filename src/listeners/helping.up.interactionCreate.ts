import * as app from "#app"
import helping from "#tables/helping.ts"

/**
 * Up the topic by using a silent notification
 */
const upCoolDown = 1000 * 60 * 60 // 1 hour

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "Up the topic by using a silent notification",
  async run(interaction) {
    if (!app.cache.ensure<boolean>("turn", true)) return

    if (!interaction.isButton()) return
    if (interaction.customId !== "up") return
    if (!interaction.channel?.isThread()) return
    if (!interaction.guild) return

    await interaction.deferUpdate()

    const topic = interaction.channel
    const guild = await app.getGuild(interaction.guild, { forceExists: true })

    if (!guild.help_forum_channel_id) return
    if (topic.parentId !== guild.help_forum_channel_id) return

    const topicState = await helping.query.where("id", topic.id).first()

    if (!topicState) {
      await helping.query.insert({
        id: topic.id,
        last_up: Date.now(),
      })
    } else if (Date.now() - +topicState.last_up < upCoolDown) {
      return await interaction.followUp({
        content: `${app.emote(interaction, "Cross")} You can only up a topic every hour.\nTry again at <t:${Math.floor(
          (+topicState.last_up + upCoolDown) / 1000,
        )}:f>.`,
        ephemeral: true,
      })
    } else {
      await helping.query.where("id", topic.id).update({ last_up: Date.now() })
    }

    await interaction.followUp({
      content: `${app.emote(interaction, "CheckMark")} Topic upped.`,
      ephemeral: true,
    })

    await app.refreshHelpingFooter(topic)
  },
}

export default listener
