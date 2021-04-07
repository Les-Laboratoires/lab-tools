import * as app from "../app"

const command: app.Command = {
  name: "fake",
  coolDown: 10000,
  guildOnly: true,
  userPermissions: ["MANAGE_WEBHOOKS"],
  description: "Fake an user message",
  positional: [
    {
      name: "target",
      description: "The faked user id",
      required: true,
    },
  ],
  async run(message) {
    let user: app.User

    try {
      user = await message.client.users.fetch(message.args.target)
    } catch (error) {
      return message.channel.send(
        `${message.client.emojis.resolve(app.Emotes.DENY)} Unknown user (${
          message.args.target
        })`
      )
    }

    if (!app.isGuildMessage(message)) return

    message.triggerCoolDown()

    const member = message.guild.member(user)

    const webhook = await message.channel.createWebhook(
      member?.displayName ?? user.username,
      {
        avatar: user.displayAvatarURL({ dynamic: true }),
      }
    )

    if (webhook.token) {
      const client = new app.WebhookClient(webhook.id, webhook.token)
      await client.send(message.rest)
      client.destroy()
    } else {
      await message.channel.send(
        `${message.client.emojis.resolve(app.Emotes.DENY)} Permission error`
      )
    }
    await message.delete().catch()
    await webhook.delete().catch()
  },
}

module.exports = command
