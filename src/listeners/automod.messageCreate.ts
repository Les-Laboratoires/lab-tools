import * as app from "../app.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "A messageCreate listener",
  async run(message) {
    app.detectAndBanSpam(message)
  },
}

export default listener
