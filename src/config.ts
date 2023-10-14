import * as app from "./app.js"

export const config: app.Config = {
  getPrefix: (message) => {
    return app.prefix(message.guild)
  },
}
