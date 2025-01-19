import { Listener } from "#core/listener"
import { detectAndBanSpammer } from "#namespaces/automod"
import * as logger from "#core/logger"

export default new Listener({
  event: "messageCreate",
  description: "Watch sent messages to detect and ban spammers",
  async run(message) {
    detectAndBanSpammer(message).catch((error) =>
      logger.error(error, "automod.messageCreate"),
    )
  },
})
