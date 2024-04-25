import * as app from "./app.js"

export const config: app.Scrap<app.Config> = () => ({
  ignoreBots: true,
  openSource: true,
  getPrefix: (message) => {
    return app.prefix(message.guild)
  },
  client: {
    intents: [
      app.IntentsBitField.Flags.Guilds,
      app.IntentsBitField.Flags.GuildMembers,
      app.IntentsBitField.Flags.GuildModeration,
      app.IntentsBitField.Flags.GuildEmojisAndStickers,
      app.IntentsBitField.Flags.GuildIntegrations,
      app.IntentsBitField.Flags.GuildWebhooks,
      app.IntentsBitField.Flags.GuildInvites,
      app.IntentsBitField.Flags.GuildVoiceStates,
      app.IntentsBitField.Flags.GuildPresences,
      app.IntentsBitField.Flags.GuildMessages,
      app.IntentsBitField.Flags.GuildMessageTyping,
      app.IntentsBitField.Flags.GuildMessageReactions,
      app.IntentsBitField.Flags.DirectMessages,
      app.IntentsBitField.Flags.DirectMessageTyping,
      app.IntentsBitField.Flags.DirectMessageReactions,
      app.IntentsBitField.Flags.MessageContent,
    ],
  },
  paginatorEmojis: {
    start: app.Emotes.Left,
    previous: app.Emotes.Minus,
    next: app.Emotes.Plus,
    end: app.Emotes.Right,
  },
  systemEmojis: {
    success: app.Emotes.CheckMark,
    error: app.Emotes.Cross,
    loading: app.Emotes.Loading,
  },
})
