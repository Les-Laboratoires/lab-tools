import * as app from "../app.js"

export default new app.Command({
  name: "fake",
  cooldown: {
    duration: 10000,
    type: app.CooldownType.ByGuild,
  },
  channelType: "all",
  botPermissions: ["MANAGE_WEBHOOKS"],
  description: "Fake an user message",
  positional: [
    {
      name: "target",
      description: "The faked user",
      type: "user",
      required: true,
    },
  ],
  async run(message) {
    const user = message.args.target

    if (!app.isGuildMessage(message)) return

    message.triggerCoolDown()

    let name = user.username

    try {
      const member = await message.guild.members.fetch(user.id)

      name = member.displayName
    } catch (error) {}

    const webhook = await message.channel.createWebhook(name, {
      avatar: user.displayAvatarURL({ dynamic: true }),
    })

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
