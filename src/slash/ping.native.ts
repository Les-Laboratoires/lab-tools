import * as app from "#app"

export default new app.SlashCommand({
  name: "ping",
  description: "Get the bot ping",
  run(interaction) {
    return interaction.base.reply({
      content: `Pong! \`${app.client.ws.ping}ms\``,
      ephemeral: true,
    })
  },
})
