import * as app from "../app.js"

import messages from "../tables/message.js"

let used = false

const intervals: Record<string, NodeJS.Timeout> = {}

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
    {
      name: "period",
      description: "The period to check (in hours)",
      castValue: "number",
      default: String(24 * 7), // 1 week
      checkCastedValue: (value) => value > 0,
      checkingErrorMessage: "The period must be greater than 0.",
    },
    {
      name: "messageCount",
      aliases: ["count"],
      description: "The minimum message count",
      castValue: "number",
      default: String(50),
      checkCastedValue: (value) => value > 0,
      checkingErrorMessage: "The period must be greater than 0.",
    },
    {
      name: "interval",
      description: "The interval to auto update the active list (in hours)",
      castValue: "number",
      default: String(24), // 1 day
      checkCastedValue: (value) => value > 0,
      checkingErrorMessage: "The period must be greater than 0.",
    },
  ],
  async run(message) {
    used = true

    const config = await app.getGuild(message.guild, true)

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
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
      if (intervals[message.guild.id] !== undefined)
        clearInterval(intervals[message.guild.id])

      intervals[message.guild.id] = setInterval(async () => {
        if (await app.hasActivity(config._id, message.args.interval))
          return await app.sendLog(
            message.guild,
            `Ignored automated active list hourly update, no activity in the last hour.`
          )

        const found = await app.updateActive(message.guild, {
          force: false,
          period: message.args.period,
          messageCount: message.args.messageCount,
          guildConfig: config,
        })

        await app.sendLog(
          message.guild,
          `Finished updating the active list, found **${found}** active members.`
        )
      }, message.args.interval * 1000 * 60 * 60)

      await message.send(
        `${app.emote(message, "CHECK")} Automated active list update enabled.`
      )
    }
  },
})
