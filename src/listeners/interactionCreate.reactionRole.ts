import * as app from "../app.js"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "A interactionCreate listener",
  async run(interaction) {
    if (
      !interaction.isSelectMenu() ||
      interaction.customId !== "reaction-role-select"
    )
      return

    const roleId = interaction.values[0]

    //if (!roleId) interaction.interaction.reply()
  },
}

export default listener
