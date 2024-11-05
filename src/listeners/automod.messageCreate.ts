import * as app from "#app"

export default new app.Listener({
  event: "messageCreate",
  description: "Watch sent messages to detect and ban spammers",
  async run(message) {
    app
      .detectAndBanSpammer(message)
      .catch((error) => app.error(error, "automod.messageCreate"))
  },
})
