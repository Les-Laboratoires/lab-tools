![Bot avatar](https://cdn.discordapp.com/avatars/555419470894596096/b93811640f236581697fa02a8936c75d.webp?size=128&fit=cover&mask=circle)

# lab-tools

> Made with [bot.ts](https://ghom.gitbook.io/bot-ts/) by **ghom**  
> CLI version: `^7.1.0`  
> Bot.ts version: `v7.0.0-Senchu`  
> Licence: `ISC`

## Description

Bot de gestion des Laboratoires, écrit en TypeScript avec le framework bot.ts.

## Specifications

You can find the documentation of bot.ts [here](https://ghom.gitbook.io/bot-ts/).  
Below you will find the specifications for **lab-tools**.  

## Configuration file

```ts
import * as app from "#app"

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

```

## Commands

### Slash commands

- ask - Ask points to a member  
- help - Show slash command details or list all slash commands  
- hint - Try to help the author of the thread by generating a hint  
- ping - Get the bot ping  
- resolve - Mark as resolved a topic  
- title - Generate a title for the thread from its content

### Textual commands

- active - Update the active list  
- autoRole - Manage the auto roles  
- backup - Manage database backups  
- config - Display guild configs  
- database - Run SQL query on database  
- deploy - Deploy Lab Tool  
- elders - Fetch the new elders of the server  
- eval - JS code evaluator  
- fake - Fake an user message  
- fetch - Fetch all messages from a channel  
- format - Format the given code  
- help - Help menu  
- info - Get information about bot  
- invite - Generate an invitation link  
- labs - Get a lab invite link  
- leaderboard - Show all leaderboards  
- moveto - Move a conversation to another channel  
- point - Check your points  
- prefix - Edit or show the bot prefix  
- rating - Rate a user or a bot  
- remind - The remind command  
- restart - Restart Lab Tool  
- terminal - Run shell command from Discord  
- todo - Manage todo tasks  
- turn - Turn on/off command handling

## Listeners

- activity.messageCreate.js  
- activity.ready.js  
- automod.messageCreate.js  
- clean.guildDelete.js  
- clean.guildMemberRemove.js  
- command.messageCreate.native.js  
- log.afterReady.native.js  
- pagination.interactionCreate.native.js  
- pagination.messageDelete.native.js  
- pagination.messageReactionAdd.native.js  
- points.interactionCreate.js  
- restart.ready.js  
- slash.guildCreate.native.js  
- slash.interactionCreate.native.js  
- slash.ready.native.js  
- tracker.guildMemberAdd.js  
- tracker.guildMemberRemove.js  
- tracker.ready.js  
- traffic.guildMemberAdd.js  
- traffic.guildMemberRemove.js

## Database

Using **pg@latest** as database.  
Below you will find a list of all the tables used by **lab-tools**.

- active  
- autoRole  
- guild  
- labs  
- message  
- point  
- note  
- restart  
- todo  
- user

## Information

This readme.md is dynamic, it will update itself with the latest information.  
If you see a mistake, please report it and an update will be made as soon as possible.

- Used by: **12** Discord guilds
- Last update date: **6/6/2024**
