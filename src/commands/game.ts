import * as app from "../app"

const command: app.Command = {
  name: "game",
  description: "Start a game",
  async run(message) {
    if (app.gameStarted)
      return message.channel.send("Ce jeu est déjà en cours.")
    return app.startGame(message.client)
  },
}

module.exports = command
