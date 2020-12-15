import * as app from "../app"

const command: app.Command = {
  name: "fake",
  coolDown: 10000,
  userPermissions: ["MANAGE_WEBHOOKS"],
  needMoney: 5,
  async run(message) {
    const [memberResolvable, content] = message.content.split(/\s+say\s+|\n/)
    if (!content || !memberResolvable)
      return message.channel.send(
        "Respecte le format, tout va bien se passer.\n`!fake <member name> say <content>`"
      )
    app.coolDowns.set(`${this.name}:${message.channel.id}`, {
      time: Date.now(),
      trigger: true,
    })
    const member = await app.resolveMember(message, memberResolvable)
    const webhook = await message.channel.createWebhook(member.displayName, {
      avatar: member.user.displayAvatarURL({ dynamic: true }),
    })
    if (webhook.token) {
      const client = new app.WebhookClient(webhook.id, webhook.token)
      await client.send(content)
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
