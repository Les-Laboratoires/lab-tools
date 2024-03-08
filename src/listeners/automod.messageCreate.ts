import * as app from "../app.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Watch sent messages to detect and ban spammers",
  async run(message) {
    app.detectAndBanSpammer(message)
  },
}

export default listener
