import * as app from "#app"

import type { ManipulateType } from "dayjs"

export default new app.SlashCommand({
  name: "remind",
  description: "Set a reminder for yourself",
  build: (builder) =>
    builder
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("The message to remind")
          .setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("duration")
          .setDescription("The duration to remind")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("duration-type")
          .setDescription("The duration type")
          .setChoices([
            {
              name: "second",
              value: "second",
            },
            {
              name: "minute",
              value: "minute",
            },
            {
              name: "hour",
              value: "hour",
            },
            {
              name: "day",
              value: "day",
            },
            {
              name: "week",
              value: "week",
            },
            {
              name: "month",
              value: "month",
            },
            {
              name: "year",
              value: "year",
            },
          ])
          .setRequired(true),
      ),
  async run(interaction) {
    await interaction.deferReply()

    const user = await app.getUser(interaction.user, true)

    const message = interaction.options.getString("message", true)
    const duration = interaction.options.getNumber("duration", true)
    const durationType = interaction.options.getString("duration-type", true)

    const remindDate = app.dayjs().add(duration, durationType as ManipulateType)

    await app.addRemind(user._id, message, remindDate.valueOf())

    await interaction.editReply(
      await app.getSystemMessage(
        "success",
        `Successfully set your reminder!\nI will remind you at the specified time.\n<t:${remindDate.unix()}:R>`,
      ),
    )
  },
})
