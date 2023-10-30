import * as app from "../app.js"

export default new app.SlashCommand({
  name: "ask",
  description: "Ask points to a member",
  async run(interaction) {
    if (!interaction.channel || !interaction.channel.isThread())
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
        )} This command can only be used in a thread channel.`,
        ephemeral: true,
      })

    if (!interaction.guild)
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
        )} This command can only be used in a guild.`,
        ephemeral: true,
      })

    if (interaction.user.id === interaction.channel.ownerId)
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
        )} You can't ask points to yourself.`,
        ephemeral: true,
      })

    const target = (await interaction.channel.fetchOwner({
      force: true,
      cache: false,
    }))!

    await interaction.reply({
      embeds: [
        new app.MessageEmbed()
          .setAuthor({
            name: `Notez l'aide de ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL()!,
          })
          .setDescription(
            `Vous pouvez attribuer des points à ${
              interaction.member
            } en fonction de la qualité de l'aide apportée en cliquant sur le bouton souhaité. Vous pouvez également noter la personne avec la commande \`${await app.prefix(
              interaction.guild,
            )}note @${interaction.user.username} <1..5>\``,
          ),
      ],
      components: [
        new app.MessageActionRow().addComponents(
          new app.MessageButton()
            .setCustomId(`point;10;${target.id};${interaction.user.id}`)
            .setLabel("Très bien")
            .setStyle("PRIMARY")
            .setEmoji("👍"),
          new app.MessageButton()
            .setCustomId(`point;15;${target.id};${interaction.user.id}`)
            .setLabel("Excellent!")
            .setStyle("PRIMARY")
            .setEmoji(interaction.client.emojis.resolve("507420549765529610")!),
        ),
      ],
    })

    await app.sendLog(
      interaction.guild,
      `${interaction.user} ask points to ${target.user} in ${interaction.channel}.`,
    )
  },
})
