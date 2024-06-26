import type { Config } from "#app/app/config.ts"
import { Emotes } from "./namespaces/emotes.ts"

const config: Config = {
  ignoreBots: true,
  openSource: true,
  async getPrefix(message) {
    return import("#app").then((app) => app.prefix(message.guild))
  },
  client: {
    intents: [
      "Guilds",
      "GuildMembers",
      "GuildModeration",
      "GuildEmojisAndStickers",
      "GuildIntegrations",
      "GuildWebhooks",
      "GuildInvites",
      "GuildVoiceStates",
      "GuildPresences",
      "GuildMessages",
      "GuildMessageTyping",
      "GuildMessageReactions",
      "DirectMessages",
      "DirectMessageTyping",
      "DirectMessageReactions",
      "MessageContent",
    ],
  },
  paginatorEmojis: {
    start: Emotes.Left,
    previous: Emotes.Minus,
    next: Emotes.Plus,
    end: Emotes.Right,
  },
  systemEmojis: {
    success: Emotes.CheckMark,
    error: Emotes.Cross,
    loading: Emotes.Loading,
  },
}

export default config
