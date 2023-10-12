import * as app from "../app.js"

import points, { getPersonalRank, getLeaderboard } from "../tables/point.js"

export default new app.Command({
  name: "point",
  description: "Check your points",
  channelType: "guild",
  aliases: ["points", "pts", "score"],
  async run(message) {
    const user = await app.getUser(message.member, true)

    const data = (await points.query
      .select(app.db.raw("sum(amount) as total"))
      .where("to_id", user._id)
      .first()) as { total: number } | undefined

    await message.send({
      embeds: [
        new app.MessageEmbed()
          .setTitle(`Points de ${message.member.displayName}`)
          .setDescription(
            `Vous avez actuellement ${
              data?.total ?? 0
            } points. Vous pouvez en gagner en aidant les autres membres et en utilisant la commande \`${await app.prefix(
              message.guild
            )}point ask @membre\`.`
          ),
      ],
    })
  },
  subs: [
    new app.Command({
      name: "ask",
      channelType: "guild",
      description: "Send a message for asking points",
      positional: [
        {
          name: "member",
          description: "The member you want to ask points",
          required: true,
          castValue: "member",
          checkCastedValue: (value, message) => value.id !== message?.member.id,
          checkingErrorMessage: "You can't ask points to yourself.",
        },
      ],
      async run(message) {
        await message.channel.send({
          embeds: [
            new app.MessageEmbed()
              .setTitle(`Notez l'aide de ${message.member.displayName}`)
              .setDescription(
                `Vous pouvez attribuer des points à ${
                  message.member
                } en fonction de la qualité de l'aide apportée en cliquant sur le bouton souhaité. Vous pouvez également noter la personne avec la commande \`${await app.prefix(
                  message.guild
                )}note @${message.member.user.username} <1..5>\``
              ),
          ],
          components: [
            new app.MessageActionRow().addComponents(
              new app.MessageButton()
                .setCustomId(
                  `point;1;${message.args.member.id};${message.member.id}`
                )
                .setLabel("Très bien")
                .setStyle("PRIMARY")
                .setEmoji("👍"),
              new app.MessageButton()
                .setCustomId(
                  `point;5;${message.args.member.id};${message.member.id}`
                )
                .setLabel("Excellent!")
                .setStyle("PRIMARY")
                .setEmoji(message.client.emojis.resolve("507420549765529610")!)
            ),
          ],
        })

        await app.sendLog(
          message.guild,
          `${message.author} ask points to ${message.args.member} in ${message.channel}.`
        )
      },
    }),
    new app.Command({
      name: "leaderboard",
      description: "Show the leaderboard of points",
      channelType: "guild",
      aliases: ["ladder", "lb", "top"],
      async run(message) {
        const data = await getLeaderboard()

        if (data.length === 0)
          return message.send(
            `${app.emote(
              message,
              "DENY"
            )} Aucun point n'a été attribué pour le moment.`
          )

        const personalRank = data.every(
          (_) => _.member_id !== message.member.id
        )
          ? await getPersonalRank(message.member.id)
          : undefined

        const embed = new app.MessageEmbed()
          .setTitle("Classement des helpers")
          .setDescription(
            data
              .map(
                (row, index) =>
                  `#\`${app.forceTextSize(
                    String(row.rank),
                    2
                  )}\` avec \`${app.forceTextSize(
                    String(row.score),
                    data[0].score.toString().length
                  )}\` pts - <@${row.member_id}>`
              )
              .join("\n")
          )

        if (personalRank)
          embed.setFields([
            {
              name: `Classement de ${message.member.displayName}`,
              value: `#\`${app.forceTextSize(
                String(personalRank.rank),
                2
              )}\` avec \`${app.forceTextSize(
                String(personalRank.score),
                data[0].score.toString().length
              )}\` pts`,
            },
          ])

        await message.send({
          embeds: [embed],
        })
      },
    }),
  ],
})
