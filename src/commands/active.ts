import { Command } from "#core/command"
import { option } from "#core/argument"

import guildTable from "#tables/guild"

import { emote } from "#namespaces/emotes"
import * as tools from "#namespaces/tools"
import * as active from "#namespaces/active"
import * as middlewares from "#namespaces/middlewares"

let used = false

export default new Command({
  name: "active",
  description: "Update the active list",
  channelType: "guild",
  middlewares: [
    middlewares.staffOnly,
    middlewares.hasConfigKey("active_role_id"),
    middlewares.isNotInUse(() => used),
  ],
  flags: [
    {
      flag: "f",
      name: "force",
      description: "Force the update of all members",
    },
  ],
  async run(message) {
    used = true

    const config = await tools.getGuild(message.guild, {
      forceExists: true,
      forceFetch: true,
    })

    const waiting = await message.channel.send(
      `${emote(message, "Loading")} Fetching members...`,
    )

    const configs = await app.getActiveConfigs(message.guild)

    for (const activeConfig of configs) {
      await app.updateActive(message.guild, {
        force: message.args.force,
        onLog: (text) => waiting.edit(text),
        guildConfig: config,
        activeConfig,
      })
    }

    used = false
  },
  subs: [
    new Command({
      name: "leaderboard",
      description: `Show the leaderboard of Activity`,
      channelType: "guild",
      aliases: ["ladder", "lb", "top", "rank"],
      options: [
        option({
          name: "lines",
          description: "Number of lines to show per page",
          type: "number",
          default: 15,
          aliases: ["line", "count"],
          validate: (value) => value > 0 && value <= 50,
        }),
      ],
      run: async (message) => {
        const guild = await tools.getGuild(message.guild, { forceExists: true })

        active.activeLadder(guild._id).send(message.channel, {
          pageLineCount: message.args.lines,
        })
      },
    }),
  ],
})
