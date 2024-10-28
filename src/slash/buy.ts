import * as app from "#app"

import userTable from "#tables/user.ts"

const prices = {
  rename: 1000,
}

export default new app.SlashCommand({
  name: "buy",
  description: "Use your coins to buy something",
  guildOnly: true,
  channelType: "guild",
  build: (builder) =>
    builder.addSubcommand((sub) =>
      sub
        .setName("rename")
        .setDescription(`Rename a member for ${prices.rename} coins`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to rename")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The new name")
            .setRequired(true),
        ),
    ),
  async run(interaction) {
    const subcommand = interaction.options.getSubcommand()

    const user = await app.getUser(interaction.user)

    if (!user) {
      return interaction.reply({
        content:
          "You don't be in the database so you don't have any coins to buy anything. Sorry!",
        ephemeral: true,
      })
    }

    if (subcommand === "rename") {
      if (user.coins < prices.rename) {
        return interaction.reply({
          content: `You don't have enough coins to buy this. You need **${prices.rename}** coins. (You have **${user.coins}** 🪙)`,
          ephemeral: true,
        })
      }

      await userTable.query
        .update({ coins: user.coins - prices.rename })
        .where("id", user.id)

      const target = interaction.options.getUser("user", true)
      const name = interaction.options.getString("name", true)
      const member = await interaction.guild.members.fetch(target.id)

      await member.setNickname(name)

      await app.sendLog(
        interaction.guild,
        `${interaction.user} renamed ${target} to \`${name}\``,
      )

      return interaction.reply({
        content: `Renaming ${target}`,
        ephemeral: true,
        allowedMentions: { parse: [] },
      })
    }
  },
})
