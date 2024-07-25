![Bot avatar](https://cdn.discordapp.com/avatars/555419470894596096/b93811640f236581697fa02a8936c75d.webp?size=128&fit=cover&mask=circle)

# lab-tools

> Made with [bot.ts](https://ghom.gitbook.io/bot-ts/) by **ghom**  
> CLI version: `^8.1.0`  
> Bot.ts version: `v8.0.0-Capi`  
> Licence: `ISC`

## Description

Bot de gestion des Laboratoires, écrit en TypeScript avec le framework bot.ts.  
This bot is private and cannot be invited in other servers.

## Specifications

You can find the documentation of bot.ts [here](https://ghom.gitbook.io/bot-ts/).  
Below you will find the specifications for **lab-tools**.  

## Configuration file

```ts
import { Config } from "#src/app/config.ts"
import { Emotes } from "#src/namespaces/emotes.ts"
import { z } from "zod"

export const config = new Config({
  ignoreBots: true,
  openSource: true,
  printNameOnReady: true,
  permissions: [],
  envSchema: z.object({
    OPENAI_API_KEY: z.string(),
  }),
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
})

export default config.options

```

## Commands

### Slash commands

- [/ask](./src/slash/ask.ts) - Ask points to a member  
- [/help](./src/slash/help.native.ts) - Show slash command details or list all slash commands  
- [/hint](./src/slash/hint.ts) - Try to help the author of the thread by generating a hint  
- [/ping](./src/slash/ping.native.ts) - Get the bot ping  
- [/resolve](./src/slash/resolve.ts) - Mark as resolved a topic  
- [/title](./src/slash/title.ts) - Generate a title for the thread from its content

### Textual commands

- [active](./src/commands/active.ts) - Update the active list  
- [autoRole](./src/commands/autoRole.ts) - Manage the auto roles  
- [backup](./src/commands/backup.ts) - Manage database backups  
- [ban](./src/commands/ban.ts) - Ban a user from all labs  
- [config](./src/commands/config.ts) - Display guild configs  
- [database](./src/commands/database.native.ts) - Run SQL query on database  
- [deploy](./src/commands/deploy.ts) - Deploy Lab Tool  
- [elders](./src/commands/elders.ts) - Fetch the new elders of the server  
- [eval](./src/commands/eval.native.ts) - JS code evaluator  
- [fake](./src/commands/fake.ts) - Fake an user message  
- [fetch](./src/commands/fetch.ts) - Fetch all messages from a channel  
- [format](./src/commands/format.ts) - Format the given code  
- [help](./src/commands/help.native.ts) - Help menu  
- [info](./src/commands/info.native.ts) - Get information about bot  
- [invite](./src/commands/invite.ts) - Generate an invitation link  
- [labs](./src/commands/labs.ts) - Get a lab invite link  
- [leaderboard](./src/commands/leaderboard.ts) - Show all leaderboards  
- [moveto](./src/commands/moveto.ts) - Move a conversation to another channel  
- [point](./src/commands/point.ts) - Check your points  
- [prefix](./src/commands/prefix.ts) - Edit or show the bot prefix  
- [rating](./src/commands/rating.ts) - Rate a user or a bot  
- [remind](./src/commands/remind.ts) - The remind command  
- [restart](./src/commands/restart.ts) - Restart Lab Tool  
- [terminal](./src/commands/terminal.native.ts) - Run shell command from Discord  
- [todo](./src/commands/todo.ts) - Manage todo tasks  
- [turn](./src/commands/turn.native.ts) - Turn on/off command handling

## Listeners

### Activity  

- [messageCreate](./src/listeners/activity.messageCreate.ts) - Record sent messages  
- [ready](./src/listeners/activity.ready.ts) - Start an interval to update the active list  

### Automod  

- [messageCreate](./src/listeners/automod.messageCreate.ts) - Watch sent messages to detect and ban spammers  

### Clean  

- [guildDelete](./src/listeners/clean.guildDelete.ts) - Remove guild from db  
- [guildMemberRemove](./src/listeners/clean.guildMemberRemove.ts) - Delete member from db  

### Command  

- [messageCreate](./src/listeners/command.messageCreate.native.ts) - Handle messages for commands  

### Log  

- [afterReady](./src/listeners/log.afterReady.native.ts) - Just log that bot is ready  

### Pagination  

- [interactionCreate](./src/listeners/pagination.interactionCreate.native.ts) - Handle interactions for pagination  
- [messageDelete](./src/listeners/pagination.messageDelete.native.ts) - Remove existing paginator  
- [messageReactionAdd](./src/listeners/pagination.messageReactionAdd.native.ts) - Handle reactions for pagination  

### Points  

- [interactionCreate](./src/listeners/points.interactionCreate.ts) - Handle points given for help quality  

### Restart  

- [ready](./src/listeners/restart.ready.ts) - Send restart messages  

### Slash  

- [guildCreate](./src/listeners/slash.guildCreate.native.ts) - Deploy slash commands to the new guild  
- [interactionCreate](./src/listeners/slash.interactionCreate.native.ts) - Handle interactions of slash commands  
- [ready](./src/listeners/slash.ready.native.ts) - Deploy slash commands everywhere  

### Tracker  

- [guildMemberAdd](./src/listeners/tracker.guildMemberAdd.ts) - Update the tracker  
- [guildMemberRemove](./src/listeners/tracker.guildMemberRemove.ts) - Update the tracker  
- [ready](./src/listeners/tracker.ready.ts) - Launch the hourly check for tracker  

### Traffic  

- [guildMemberAdd](./src/listeners/traffic.guildMemberAdd.ts) - Prepares to welcome a new member  
- [guildMemberRemove](./src/listeners/traffic.guildMemberRemove.ts) - Announces when a member leaves the server

## Database

Using **pg@latest** as database.  
Below you will find a list of all the tables used by **lab-tools**.

- [active](./src/tables/active.ts) - Active users in a guild  
- [autoRole](./src/tables/autoRole.ts) - Auto roles in a guild  
- [guild](./src/tables/guild.ts) - Guild settings  
- [labs](./src/tables/lab.ts) - Laboratory list  
- [message](./src/tables/message.ts) - All messages sent by users in a guild  
- [point](./src/tables/point.ts) - Point reward logs  
- [note](./src/tables/rating.ts) - Rating of a user by another user  
- [restart](./src/tables/restart.ts) - Restart message for the deploy command  
- [todo](./src/tables/todo.ts) - To-do list for users  
- [user](./src/tables/user.ts) - User data

## Information

This readme.md is dynamic, it will update itself with the latest information.  
If you see a mistake, please report it and an update will be made as soon as possible.

- Used by: **12** Discord guilds
- Last update date: **7/25/2024**
