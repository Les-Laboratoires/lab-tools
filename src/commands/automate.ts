import * as app from "../app.js"

export default new app.Command({
  name: "automate",
  description: "The automate command",
  channelType: "guild",
  positional: [
    {
      name: "command",
      castValue: "command",
      description: "The command to automate",
      required: true,
    },
    {
      name: "period",
      description: "The period to automate",
      checkValue: ["hourly", "daily", "weekly", "monthly", "yearly"],
      default: "daily",
    },
  ],
  async run(message) {},
})
