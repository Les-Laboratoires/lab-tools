import * as app from "#app"

import messageTable from "#tables/message.ts"

export default new app.SlashCommand({
  name: "profile",
  description: "View your profile",
  guildOnly: true,
  channelType: "guild",
  async run(interaction) {
    const user = await app.getFullUser(interaction.user, interaction.guild)

    if (!user) return interaction.reply("You don't have a profile yet.")

    const guild = await app.getGuild(interaction.guild)

    if (!guild)
      return interaction.reply("This guild is not registered in the database.")

    const pointRank = await app.getPointRank(interaction.user)

    return interaction.reply({
      embeds: [
        new app.EmbedBuilder()
          .setTitle(`Profile of ${interaction.user.tag}`)
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(
            (pointRank
              ? `Helper rank: **#${pointRank.rank}** (**${user.points}** pts)\n`
              : "") +
              `Total money: **${user.coins}** 🪙\n` +
              `Hourly money: **${Math.floor(app.getUserHourlyCoins(user))}** 🪙\n` +
              `Messages sent: **${await messageTable.cache.count(
                `author_id = ${user._id} AND guild_id = ${guild._id}`,
              )}**`,
          )
          .setFields(
            {
              name: `Rating: ${app.renderRatingValue(user.rating)}`,
              value: app.renderRatingBar(user.rating),
              inline: true,
            },
            {
              name: "Prestige",
              value:
                user.active && guild.active_role_id
                  ? app.roleMention(guild.active_role_id)
                  : "`nope`",
              inline: true,
            },
          ),
      ],
    })
  },
})
