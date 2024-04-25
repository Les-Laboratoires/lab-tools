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

    try {
      await message.delete()
    } catch (e) {}

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

    // Show view

    const view = await message.channel.send(
      `${app.emote(message, "WAIT")} Fetching messages...`,
    )

    // Fetch the messages to move

    let messages = await message.channel.messages
      .fetch({ after: firstMessage.id, cache: false })
      .then((result) => Array.from(result.values()))

    messages.push(firstMessage)
    messages = messages.filter((m) => m.id !== view.id)

    const messageCountToDelete = messages.length

    if (messages.length === 0)
      return await view.edit(`${app.emote(message, "DENY")} No messages found.`)

    if (messages.length > 20) messages = messages.slice(0, 20)

    // Trigger cooldown after the validation check

    message.triggerCoolDown()

    // Group the message authors as GuildMembers and webhook ids

    const members = new Set(
      messages
        .map((msg) => msg.member)
        .filter((m): m is app.GuildMember => !!m),
    )

    const webhookAuthors = new Set(
      messages.map((msg) => msg.webhookId).filter((a): a is string => !!a),
    )

    // Prepare webhooks for message author

    await view.edit(`${app.emote(message, "WAIT")} Creating webhooks...`)

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

    for (const id of webhookAuthors) {
      const baseWebhook = await message.client.fetchWebhook(id)

      const webhook = await destination.createWebhook({
        name: baseWebhook.name,
        avatar: baseWebhook.avatar,
      })

      if (!webhook.token) continue

      const client = new app.WebhookClient(webhook)

      webhooks.set(id, { webhook, client })
    }

    if (messages.some((m) => m.system)) {
      const webhook = await destination.createWebhook({
        name: "System",
        avatar: message.guild.iconURL(),
      })

      if (webhook.token) {
        const client = new app.WebhookClient(webhook)

        webhooks.set("system", { webhook, client })
      }
    }

    // Send the messages to the destination channel

    await view.edit(`${app.emote(message, "WAIT")} Sending messages...`)

    for (const m of messages.toReversed()) {
      const webhookObject = webhooks.get(m.author.id)

      if (!webhookObject) {
        messages.splice(messages.indexOf(m), 1)
        continue
      }

      try {
        await webhookObject.client.send({
          content: m.content,
          embeds: m.embeds,
          files: m.attachments.map((a) => a.url),
        })
      } catch (e) {
        messages.splice(messages.indexOf(m), 1)
      }
    }

    await view.edit(`${app.emote(message, "WAIT")} Deleting old messages...`)

    try {
      await message.channel.bulkDelete(messages)
    } catch (e) {}

    for (const { client, webhook } of webhooks.values()) {
      client.destroy()
      try {
        await webhook.delete()
      } catch (e) {}
    }

    await view.edit(
      `${app.emote(message, "CHECK")} Conversation moved to ${destination}${
        messages.length < messageCountToDelete
          ? ` (${messageCountToDelete - messages.length} messages failed to move)`
          : ""
      }`,
    )
  },
})
