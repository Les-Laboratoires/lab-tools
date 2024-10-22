import * as app from "#app"

import guilds from "#tables/guild.ts"

export default new app.Command({
  name: "prefix",
  guildOwnerOnly: true,
  channelType: "guild",
  description: "Edit or show the bot prefix",
  positional: [
    {
      name: "prefix",
      description: "The new prefix",
      type: "string",
      validate: (value) => value.length < 10 && /^\S/.test(value),
    },
  ],
  async run(message) {
    const prefix = message.args.prefix

    if (!prefix)
      return message.channel.send(
        `My current prefix for "**${message.guild}**" is \`${await app.prefix(
          message.guild,
        )}\``,
      )

    await guilds.query
      .insert({
        id: message.guild.id,
        prefix: prefix,
      })
      .onConflict("id")
      .merge(["prefix"])

    await message.channel.send(
      `My new prefix for "**${message.guild}**" is \`${prefix}\``,
    )
  },
})
