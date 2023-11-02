import * as app from "../app.js"

export interface PointLadderLine {
  target: string
  score: number
  rank: number
}

export const pointLadder = new app.Ladder<PointLadderLine>({
  title: "Helpers",
  async fetchLines(options) {
    return app.orm.raw(`
      select
          sum(amount) as score,
          rank() over (
              order by sum(amount) desc
          ) as rank,
          user.id as target
      from point
      left join user on point.to_id = user._id
      group by to_id
      having user.is_bot = false
      order by score desc
      limit ${options.pageLineCount}
      offset ${options.pageIndex * options.pageLineCount}
    `)
  },
  async fetchLineCount() {
    return app.orm
      .raw(
        `select
          count(*) as total
        from (
          select
            sum(amount) as score,
            rank() over (
                order by sum(amount) desc
            ) as rank,
            user.id as target
          from point
          left join user on point.to_id = user._id
          group by to_id
          having user.is_bot = false
          order by score desc
        )`,
      )
      .then((rows: any) => rows[0]?.total ?? 0)
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
          )}note @${helper.username} <1..5>\``,
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
