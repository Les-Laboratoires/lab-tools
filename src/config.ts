import * as app from "./app.js"

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
      "GuildBans",
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
}
