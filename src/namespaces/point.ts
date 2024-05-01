import * as app from "#app"

import point from "#tables/point.js"

export interface PointLadderLine {
  target: string
  score: number
  rank: number
}

export const pointLadder = new app.Ladder<PointLadderLine>({
  title: "Helpers",
  async fetchLines(options) {
    return point.query
      .select([
        app.orm.raw('sum("point"."amount") as "score"'),
        app.orm.raw(
          'rank() over (order by sum("point"."amount") desc) as "rank"',
        ),
        "user.id as target",
      ])
      .leftJoin("user", "point.to_id", "user._id")
      .where("user.is_bot", false)
      .groupBy("user.id")
      .orderBy("score", "desc")
      .limit(options.pageLineCount)
      .offset(options.pageIndex * options.pageLineCount)
  },
  async fetchLineCount() {
    return app.countOf(
      point.query
        .distinct("to_id")
        .join("user", "point.to_id", "user._id")
        .where("user.is_bot", false)
        .groupBy("to_id"),
      "to_id",
    )
  },
  formatLine(line, index, lines) {
    return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
      String(line.score),
      Math.max(...lines.map((l) => l.score)).toString().length,
    )}\` pts - <@${line.target}>`
  },
})

export async function buildAskPointEmbed(
  helper: app.User,
  helped: { id: string },
  guild: app.Guild,
) {
  return {
    embeds: [
      new app.EmbedBuilder()
        .setAuthor({
          name: `Notez l'aide de ${helper.username}`,
          iconURL: helper.avatarURL()!,
        })
        .setDescription(
          `Vous pouvez attribuer des points à ${helper} en fonction de la qualité de l'aide apportée en cliquant sur le bouton souhaité. Vous pouvez également noter la personne avec la commande \`${await app.prefix(
            guild,
          )}rate @${helper.username} <1..5>\``,
        ),
    ],
    components: [
      new app.ActionRowBuilder<app.ButtonBuilder>().addComponents(
        new app.ButtonBuilder()
          .setCustomId(`point;10;${helped.id};${helper.id}`)
          .setLabel("Très bien")
          .setStyle(app.ButtonStyle.Primary)
          .setEmoji("👍"),
        new app.ButtonBuilder()
          .setCustomId(`point;15;${helped.id};${helper.id}`)
          .setLabel("Excellent!")
          .setStyle(app.ButtonStyle.Primary)
          .setEmoji("507420549765529610"),
      ),
    ],
  }
}
