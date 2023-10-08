import * as app from "../app.js"

import automation from "../tables/automation.js"

export default new app.Command({
  name: "automate",
  aliases: ["auto", "cron", "schedule"],
  description: "The automate command",
  channelType: "guild",
  positional: [
    {
      name: "command",
      castValue: "command",
      checkCastedValue: (value) =>
        value.options.channelType === "guild" ||
        value.options.channelType === "all",
      description: "The guild command to automate",
      required: true,
    },
    {
      name: "period",
      description: "The period to automate",
      checkValue: ["hourly", "daily", "weekly", "monthly", "yearly"],
      default: "daily",
    },
  ],
  options: [
    {
      name: "args",
      aliases: ["param", "params", "arguments", "parameters"],
      description: "The arguments to pass to the command",
      castValue: "array",
    },
  ],
  async run(message) {
    const config = await app.getGuild(message.guild, true)

    const command = message.args.command as app.Command<"guild">
    const period = message.args.period as
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"

    await automation.query
      .where("guild_id", config._id)
      .where("command", command.options.name)
      .del()

    message.args = message.args.args ?? []

    await command.options.run.bind(command)(message)

    await automation.query.insert({
      command: command.options.name,
      period:
        period === "hourly"
          ? 1000 * 60 * 60
          : period === "daily"
          ? 1000 * 60 * 60 * 24
          : period === "weekly"
          ? 1000 * 60 * 60 * 24 * 7
          : period === "monthly"
          ? 1000 * 60 * 60 * 24 * 30
          : 1000 * 60 * 60 * 24 * 365,
      guild_id: config._id,
      ron_at: Date.now(),
    })

    return message.send(
      `${app.emote(message, "CHECK")} Command \`${
        command.options.name
      }\` is now automated !`
    )
  },
})
