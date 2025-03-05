import { Listener } from "#core/listener"
import * as logger from "#core/logger"
import { detectAndBanSpammer } from "#namespaces/automod"

export default new Listener({
  event: "messageCreate",
  description: "Watch sent messages to detect and ban spammers",
  async run(message) {
    detectAndBanSpammer(message).catch((error) =>
      logger.error(error, "automod.messageCreate"),
    )
  },
})
