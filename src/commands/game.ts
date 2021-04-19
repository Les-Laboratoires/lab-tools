import * as app from "../app"

const command: app.Command = {
  name: "game",
  description: "Start a game",
  async run(message) {
    return app.startGame(message.client)
  }
}

module.exports = command