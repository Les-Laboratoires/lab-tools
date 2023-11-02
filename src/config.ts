import * as app from "./app.js"

export const config: app.Config = {
  ignoreBots: true,
  getPrefix: (message) => {
    return app.prefix(message.guild)
  },
  client: {
    intents: [
      "Guilds",
      "GuildMembers",
      "GuildBans",
      "GuildEmojisAndStickers",
      "GuildIntegrations",
      "GuildWebhooks",
      "GuildInvites",
      "GuildVoiceStates",
      "GuildPresences",
      "GuildMessages",
      "MessageContent",
      "GuildMessageTyping",
      "GuildMessageReactions",
      "DirectMessages",
      "DirectMessageTyping",
      "DirectMessageReactions",
    ],
  },
}
