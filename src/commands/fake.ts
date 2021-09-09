import * as app from "../app.js"

export default new app.Command({
  name: "fake",
  coolDown: 10000,
  channelType: "all",
  botPermissions: ["MANAGE_WEBHOOKS"],
  description: "Fake an user message",
  positional: [
    {
      name: "target",
      description: "The faked user id",
      castValue: "user",
      required: true,
    },
  ],
  async run(message) {
    const user: app.User = message.args.target

    if (!app.isGuildMessage(message)) return

    message.triggerCoolDown()

    const member = await message.guild.members.fetch(user.id)

    const webhook = await message.channel.createWebhook(
      member?.displayName ?? user.username,
      {
        avatar: user.displayAvatarURL({ dynamic: true }),
      }
    )

    if (webhook.token) {
      const client = new app.WebhookClient(webhook)
      await client.send(message.rest)
      client.destroy()
    } else {
      await message.channel.send(
        `${app.emote(message, "DENY")} Permission error`
      )
    }
    await message.delete().catch()
    await webhook.delete().catch()
  },
})
