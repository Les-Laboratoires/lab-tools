import * as app from "#app"

import { Emotes } from "./namespaces/tools.ts"

export const config: app.Config = {
  ignoreBots: true,
  openSource: true,
  getPrefix: (message) => {
    return app.prefix(message.guild)
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
