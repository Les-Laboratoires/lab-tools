![Bot avatar](https://cdn.discordapp.com/avatars/555419470894596096/b93811640f236581697fa02a8936c75d.png?size=128&fit=cover&mask=circle)

# lab-tools

> Made with [bot.ts](https://ghom.gitbook.io/bot-ts/) by **ghom**  
> CLI version: `9.0.7`  
> Bot.ts version: `v9.0.0-Nirbose`  
> Licence: `ISC`

## Description

Bot de gestion des Laboratoires, écrit en TypeScript avec le framework bot.ts.  
This bot is private and cannot be invited in other servers.

## Specifications

You can find the documentation of bot.ts [here](https://ghom.gitbook.io/bot-ts/).  
Below you will find the specifications for **lab-tools**.

## Configuration file

```ts
import { Config } from "#core/config"
import { Emotes } from "#namespaces/emotes"
import { z } from "zod"

export const config = new Config({
  ignoreBots: true,
  openSource: true,
  permissions: [],
  envSchema: z.object({
    OPENAI_API_KEY: z.string(),
  }),
  async getPrefix(message) {
    return import("#namespaces/tools").then((app) => app.prefix(message.guild))
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

## Cron jobs

- [active](src/cron/active.ts) - Refresh the active member list every 12 hours  
- [money](src/cron/money.ts) - Give money to users hourly  
- [remind](src/cron/remind.ts) - Check reminders every minute  
- [tracker](src/cron/tracker.ts) - Update the guild tracker every 5 minutes

## Commands

### Slash commands

- [/buy](src/slash/buy.ts) - Use your coins to buy something  
- [/docs](src/slash/docs.ts) - Send doc links for the provided tags  
- [/help](src/slash/help.native.ts) - Show slash command details or list all slash commands  
- [/hint](src/slash/hint.ts) - Try to help the author of the thread by generating a hint  
- [/ping](src/slash/ping.native.ts) - Get the bot ping  
- [/profile](src/slash/profile.ts) - View your profile  
- [/purge](src/slash/purge.ts) - Purge messages in a channel  
- [/remind](src/slash/remind.ts) - Set a reminder for yourself  
- [/title](src/slash/title.ts) - Generate a title for the thread from its content

### Textual commands

- [active](src/commands/active.ts) - Update the active list  
- [autoRole](src/commands/autoRole.ts) - Manage the auto roles  
- [backup](src/commands/backup.ts) - Manage database backups  
- [ban](src/commands/ban.ts) - Ban a user from all labs  
- [config](src/commands/config.ts) - Display guild configs  
- [database](src/commands/database.native.ts) - Run SQL query on database  
- [deploy](src/commands/deploy.ts) - Deploy Lab Tool  
- [elders](src/commands/elders.ts) - Fetch the new elders of the server  
- [eval](src/commands/eval.native.ts) - JS code evaluator  
- [fake](src/commands/fake.ts) - Fake an user message  
- [fetch](src/commands/fetch.ts) - Fetch all messages from a channel  
- [format](src/commands/format.ts) - Format the given code  
- [help](src/commands/help.native.ts) - Help menu  
- [info](src/commands/info.native.ts) - Get information about bot  
- [invite](src/commands/invite.ts) - Generate an invitation link  
- [labs](src/commands/labs.ts) - Get a lab invite link  
- [leaderboard](src/commands/leaderboard.ts) - Show all leaderboards  
- [moveto](src/commands/moveto.ts) - Move a conversation to another channel  
- [point](src/commands/point.ts) - Check your points  
- [prefix](src/commands/prefix.ts) - Edit or show the bot prefix  
- [rating](src/commands/rating.ts) - Rate a user or a bot  
- [reply](src/commands/reply.ts) - The reply command  
- [restart](src/commands/restart.ts) - Restart Lab Tool  
- [terminal](src/commands/terminal.native.ts) - Run shell command from Discord  
- [todo](src/commands/todo.ts) - Manage todo tasks  
- [turn](src/commands/turn.native.ts) - Turn on/off command handling

## Buttons

- [givePoints](src/buttons/givePoints.ts) - Gives some helping points to a user  
- [pagination](src/buttons/pagination.native.ts) - The pagination button  
- [resolveTopic](src/buttons/resolveTopic.ts) - Mark the topic as resolved  
- [upTopic](src/buttons/upTopic.ts) - Up the topic in the help forum

## Listeners

### Activity  

- [messageCreate](src/listeners/activity.messageCreate.ts) - Record sent messages  

### Automod  

- [messageCreate](src/listeners/automod.messageCreate.ts) - Watch sent messages to detect and ban spammers  

### Button  

- [interactionCreate](src/listeners/button.interactionCreate.native.ts) - Handle the interactions for buttons  

### Clean  

- [guildDelete](src/listeners/clean.guildDelete.ts) - Remove guild from db  
- [guildMemberRemove](src/listeners/clean.guildMemberRemove.ts) - Delete member from db  

### Command  

- [messageCreate](src/listeners/command.messageCreate.native.ts) - Handle the messages for commands  

### Cron  

- [ready](src/listeners/cron.ready.native.ts) - Launch all cron jobs  

### Helping  

- [threadDelete](src/listeners/helping.clean.threadDelete.ts) - Clean up the helping table when a thread is deleted  
- [messageCreate](src/listeners/helping.footer.messageCreate.ts) - Handle messages in the help forum channels  
- [threadCreate](src/listeners/helping.info.threadCreate.ts) - A threadCreate listener for helping.info  

### Log  

- [afterReady](src/listeners/log.afterReady.native.ts) - Just log that bot is ready  

### Pagination  

- [messageDelete](src/listeners/pagination.messageDelete.native.ts) - Remove existing deleted paginator  
- [messageReactionAdd](src/listeners/pagination.messageReactionAdd.native.ts) - Handle the reactions for pagination  

### Reply  

- [messageCreate](src/listeners/reply.messageCreate.ts) - A messageCreate listener for reply  

### Restart  

- [ready](src/listeners/restart.ready.ts) - Send restart messages  

### Slash  

- [guildCreate](src/listeners/slash.guildCreate.native.ts) - Deploy the slash commands to the new guild  
- [interactionCreate](src/listeners/slash.interactionCreate.native.ts) - Handle the interactions for slash commands  
- [ready](src/listeners/slash.ready.native.ts) - Deploy the slash commands  

### Tracker  

- [guildMemberAdd](src/listeners/tracker.guildMemberAdd.ts) - Update the tracker  
- [guildMemberRemove](src/listeners/tracker.guildMemberRemove.ts) - Update the tracker  

### Traffic  

- [guildMemberAdd](src/listeners/traffic.guildMemberAdd.ts) - Prepares to welcome a new member  
- [guildMemberRemove](src/listeners/traffic.guildMemberRemove.ts) - Announces when a member leaves the server

## Database

Using **pg@^8.13.0** as database.  
Below you will find a list of all the tables used by **lab-tools**.

- [active](src/tables/active.ts) - Active users in a guild  
- [autoRole](src/tables/autoRole.ts) - Auto roles in a guild  
- [guild](src/tables/guild.ts) - Guild settings  
- [helping](src/tables/helping.ts) - Table of helping  
- [labs](src/tables/lab.ts) - Laboratory list  
- [message](src/tables/message.ts) - All messages sent by users in a guild  
- [point](src/tables/point.ts) - Point reward logs  
- [note](src/tables/rating.ts) - Rating of a user by another user  
- [remind](src/tables/remind.ts) - Table of remind  
- [reply](src/tables/reply.ts) - Stores the automatic replies  
- [restart](src/tables/restart.ts) - Restart message for the deploy command  
- [todo](src/tables/todo.ts) - To-do list for users  
- [user](src/tables/user.ts) - User data

## Information

This readme.md is dynamic, it will update itself with the latest information.  
If you see a mistake, please report it and an update will be made as soon as possible.

- Used by: **12** Discord guilds
- Last update date: **3/5/2025**
