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
      description: "The period to check",
      castValue: "number",
      default: "1814400000", // 3 weeks
      checkCastedValue: (value) => value > 0,
    },
    {
      name: "messageCount",
      aliases: ["count"],
      description: "The minimum message count",
      castValue: "number",
      default: "50",
      checkCastedValue: (value) => value > 0,
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
      const autoUpdatePeriod = 1000 * 60 * 60

      if (intervals[message.guild.id] !== undefined)
        clearInterval(intervals[message.guild.id])

      intervals[message.guild.id] = setInterval(async () => {
        const date = new Date()

        date.setTime(date.getTime() - autoUpdatePeriod)

        const activityLastHour = await messages.query
          .where("guild_id", config._id)
          .where("created_at", ">", date.toISOString())
          .select(app.orm.database.raw("count(*) as messageCount"))
          .limit(1)
          .then((rows) => rows[0] as unknown as { messageCount: number })

        if (activityLastHour.messageCount === 0) return

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
      }, autoUpdatePeriod)

      await message.send(
        `${app.emote(
          message,
          "CHECK"
        )} Automated active list hourly update enabled.`
      )
    }
  },
})
