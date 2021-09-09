import * as app from "../app.js"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (app.isNormalMessage(message))
      if (app.isGuildMessage(message))
        if (message.channel.id === "")
          app.gameList.forEach((game) =>
            game.options.handleMessage.bind(game)(message)
          )
  },
}

export default listener
