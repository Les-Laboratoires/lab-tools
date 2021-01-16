import * as app from "../app"

const command: app.Command = {
  name: "fake",
  coolDown: 10000,
  needMoney: 10 / 100,
  userPermissions: ["MANAGE_WEBHOOKS"],
  args: [
    {
      name: "target",
      aliases: ["member", "user", "guy"],
      castValue: (value, message) => app.resolveMember(message, value),
      required: true,
    },
    {
      name: "content",
      aliases: ["send", "say", "msg", "speak", "message"],
      required: true,
    },
  ],
  async run(message) {
    app.coolDowns.set(`${this.name}:${message.channel.id}`, {
      time: Date.now(),
      trigger: true,
    })

    const member = message.args.target as app.GuildMember

    const webhook = await message.channel.createWebhook(member.displayName, {
      avatar: member.user.displayAvatarURL({ dynamic: true }),
    })

    if (webhook.token) {
      const client = new app.WebhookClient(webhook.id, webhook.token)
      await client.send(message.args.content)
      client.destroy()
    } else {
      await message.channel.send(
        "Hmmmmmmmm... fail <:harold:556967769304727564>"
      )
    }
    await message.delete().catch()
    await webhook.delete().catch()
  },
}

module.exports = command
