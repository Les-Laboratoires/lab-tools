import * as app from "../app.js"

export default new app.Command({
  name: "moveto",
  description: "Move a conversation to another channel",
  channelType: "guild",
  aliases: ["move", "mt", "mv"],
  botPermissions: ["ManageWebhooks", "ManageChannels"],
  middlewares: [app.middlewares.staffOnly()],
  cooldown: {
    duration: 10000,
    type: app.CooldownType.ByGuild,
  },
  positional: [
    {
      name: "destination",
      description: "The destination channel",
      type: "channel",
      required: true,
    },
    {
      name: "firstMessage",
      description: "The first message of the conversation to move",
      type: "message",
      required: true,
    },
  ],
  async run(message) {
    const destination = message.args.destination as app.GuildChannel
    const firstMessage = message.args.firstMessage as app.Message<true>

    await message.delete().catch()

    if (!destination.isTextBased())
      return await message.channel.send(
        `${app.emote(message, "DENY")} Destination channel must be a guild text channel.`,
      )

    if (!message.guild.channels.cache.has(destination.id))
      return await message.channel.send(
        `${app.emote(message, "DENY")} Destination channel must be in the same guild.`,
      )

    if (firstMessage.channel.id !== message.channel.id)
      return await message.channel.send(
        `${app.emote(message, "DENY")} First message must be in the same channel.`,
      )

    // Fetch the messages to move

    let messages = await message.channel.messages
      .fetch({ after: firstMessage.id, cache: false })
      .then((result) => Array.from(result.values()))

    messages.push(firstMessage)

    if (messages.length === 0)
      return await message.channel.send(
        `${app.emote(message, "DENY")} No messages found.`,
      )

    if (messages.length > 20) messages = messages.slice(0, 20)

    // Trigger cooldown after the validation check

    message.triggerCoolDown()

    // Group the message authors as GuildMembers

    const members = new Set(
      messages
        .map((msg) => msg.member)
        .filter((m): m is app.GuildMember => !!m),
    )

    // Prepare a webhook for message author

    const webhooks = new Map<
      string,
      { webhook: app.Webhook; client: app.WebhookClient }
    >()

    for (const member of members) {
      const webhook = await destination.createWebhook({
        name: member.displayName,
        avatar: member.user.displayAvatarURL(),
      })

      if (!webhook.token) continue

      const client = new app.WebhookClient(webhook)

      webhooks.set(member.id, { webhook, client })
    }

    // Send the messages to the destination channel

    for (const m of messages.toReversed()) {
      const webhookObject = webhooks.get(m.author.id)

      if (!webhookObject) continue

      await webhookObject.client.send(m.content)
    }

    await message.channel.bulkDelete(messages).catch()

    for (const { client, webhook } of webhooks.values()) {
      client.destroy()
      await webhook.delete().catch()
    }

    await message.channel.send(
      `${app.emote(message, "CHECK")} Conversation moved to ${destination}`,
    )
  },
})
