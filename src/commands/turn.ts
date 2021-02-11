import * as app from "../app"

const command: app.Command = {
  name: "turn",
  botOwner: true,
  positional: [
    {
      name: "mode",
      description: "Power mode of bot. on/off",
      default: () => (app.cache.ensure("turn", false) ? "off" : "on"),
      checkValue: /^on|off$/,
      required: true,
    },
  ],
  async run(message) {
    const turn = message.positional.mode === "on"
    app.cache.set("turn", turn)
    return message.channel.send(
      turn
        ? "Bonjour <:haroldpeek:681598035897221182>"
        : "Au revoir <:harold:556967769304727564>"
    )
  },
}

module.exports = command
