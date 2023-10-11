import * as app from "../app.js"

let used = false
let interval: NodeJS.Timeout | undefined = undefined

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
      default: String(1000 * 60 * 60 * 24 * 7),
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

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
    )

    await app.updateActive(message.guild, {
      force: message.args.force,
      period: message.args.period,
      messageCount: message.args.messageCount,
      onLog: (text) => waiting.edit(text),
    })

    used = false

    if (message.args.auto) {
      await message.send(
        `${app.emote(
          message,
          "CHECK"
        )} Automated active list hourly update enabled.`
      )

      if (interval !== undefined) clearInterval(interval)

      interval = setInterval(async () => {
        const found = await app.updateActive(message.guild, {
          force: false,
          period: message.args.period,
          messageCount: message.args.messageCount,
        })

        await app.sendLog(
          message.guild,
          `Finished updating the active list, found ${found} active members.`
        )
      }, 1000 * 60 * 60)
    }
  },
})
