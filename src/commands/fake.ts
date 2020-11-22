import * as app from "../app"

const command: app.Command = {
  name: "fake",
  coolDown: 10000,
  userPermissions: ["MANAGE_WEBHOOKS"],
  async run(message) {
    const [memberResolvable, content] = message.content.split(/\s+say\s+|\n/)
    if (!content || !memberResolvable)
      return message.channel.send(
        "Respecte le format, tout va bien se passer.\n`!fake <member name> say <content>`"
      )
    const member = await app.resolveMember(message, memberResolvable)
    const webhook = await message.channel.createWebhook(member.displayName, {
      avatar: member.user.displayAvatarURL({ dynamic: true }),
    })
    if (webhook.token) {
      const client = new app.WebhookClient(webhook.id, webhook.token)
      await message.delete().catch()
      await client.send(content)
      await webhook.delete()
      client.destroy()
    } else {
      return message.channel.send(
        "Hmmmmmmmm... fail <:harold:556967769304727564>"
      )
    }
  },
}

module.exports = command
