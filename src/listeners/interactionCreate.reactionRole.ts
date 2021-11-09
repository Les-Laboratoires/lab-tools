import * as app from "../app.js"

import rero, {
  customId,
  getReactionRoleMessageOptions,
} from "../tables/rero.js"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "A interactionCreate listener",
  async run(interaction) {
    if (
      !interaction.isSelectMenu() ||
      interaction.customId !== customId ||
      !interaction.guild
    )
      return

    const member = await interaction.guild.members.fetch(interaction.user)

    const roleId = interaction.values[0]

    if (!roleId)
      return interaction.reply(
        `${app.emote(interaction, "DENY")} Invalid selection.`
      )

    const role = await interaction.guild.roles.fetch(roleId)

    if (!role) {
      await rero.query.delete().where({ role_id: roleId })

      await interaction.update(
        await getReactionRoleMessageOptions(interaction.guild)
      )

      return interaction.reply(
        `${app.emote(interaction, "DENY")} Invalid role.`
      )
    }

    const action = member.roles.cache.has(roleId) ? "remove" : "add"

    await member.roles[action](roleId)

    return interaction.reply(
      `${app.emote(interaction, "CHECK")} Successfully ${action}ed the **${
        role.name
      }** role.`
    )
  },
}

export default listener
