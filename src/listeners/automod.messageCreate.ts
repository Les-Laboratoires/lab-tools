import * as app from "../app.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "A messageCreate listener",
  async run(message) {
    app.detectAndBanSpammer(message)
  },
}

export default listener
