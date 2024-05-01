import * as app from "#app"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Watch sent messages to detect and ban spammers",
  async run(message) {
    app
      .detectAndBanSpammer(message)
      .catch((error) => app.error("automod.messageCreate", error))
  },
}

export default listener
