import * as app from "../app.js"

let used = false

export default new app.Command({
  name: "active",
  description: "Update the active list",
  channelType: "guild",
  middlewares: [
    app.staffOnly(),
    app.hasConfigKey("active_role_id"),
    app.isNotInUse(() => used),
  ],
  flags: [
    {
      flag: "f",
      name: "force",
      description: "Force the update of all members",
    },
    {
      flag: "a",
      name: "auto",
      description: "Automatically update the active list",
    },
  ],
  options: [
    app.option({
      name: "period",
      description: "The period to check (in hours)",
      type: "number",
      default: 24 * 7, // 1 week
      validate: (value) => value > 0,
      validationErrorMessage: "The period must be greater than 0.",
    }),
    app.option({
      name: "messageCount",
      aliases: ["count"],
      description: "The minimum message count",
      type: "number",
      default: 50,
      validate: (value) => value > 0,
      validationErrorMessage: "The period must be greater than 0.",
    }),
    app.option({
      name: "interval",
      description: "The interval to auto update the active list (in hours)",
      type: "number",
      default: 24, // 1 day
      validate: (value) => value > 0,
      validationErrorMessage: "The period must be greater than 0.",
    }),
  ],
  async run(message) {
    used = true

    const config = await app.getGuild(message.guild, true)

    const waiting = await message.channel.send(
      `${app.emote(message, "WAIT")} Fetching members...`,
    )

    await app.updateActive(message.guild, {
      force: message.args.force,
      period: message.args.period,
      messageCount: message.args.messageCount,
      onLog: (text) => waiting.edit(text),
      guildConfig: config,
    })

    used = false

    if (message.args.auto) {
      await message.channel.send(
        `${app.emote(message, "CHECK")} Automated active list update enabled.`,
      )
    }
  },
  subs: [
    new app.Command({
      name: "leaderboard",
      description: `Show the leaderboard of Activity`,
      channelType: "guild",
      aliases: ["ladder", "lb", "top", "rank"],
      options: [
        app.option({
          name: "lines",
          description: "Number of lines to show per page",
          type: "number",
          default: 15,
          aliases: ["line", "count"],
          validate: (value) => value > 0 && value <= 50,
        }),
      ],
      run: async (message) => {
        const guild = await app.getGuild(message.guild, true)

        app.activeLadder(guild._id).send(message.channel, {
          pageLineCount: message.args.lines,
        })
      },
    }),
  ],
})
