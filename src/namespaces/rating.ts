import * as app from "../app.js"

import table from "../tables/rating.js"

export interface RatingLadderLine {
  target: string
  score: number
  rank: number
  rating_count: number
}

const mineRatingCount = 5

export const ratingLadder = new app.Ladder<RatingLadderLine>({
  title: "Rating",
  async fetchLines(options) {
    return table.query
      .avg({ score: "value" })
      .count({ rating_count: "from_id" })
      .select([
        "user.id as target",
        app.orm.raw("rank() over (order by avg(value) desc) as rank"),
      ])
      .leftJoin("user", "note.to_id", "user._id")
      .groupBy("user.id")
      .having(app.orm.raw("count(from_id)"), ">=", mineRatingCount)
      .and.where("user.is_bot", false)
      .orderBy("score", "desc")
      .limit(options.pageLineCount)
      .offset(options.pageIndex * options.pageLineCount) as any
  },
  async fetchLineCount() {
    return app.countOf(
      table.query
        .leftJoin("user", "note.to_id", "user._id")
        .where("user.is_bot", "=", false)
        .groupBy("user._id")
        .having(app.orm.raw("count(*)"), ">=", mineRatingCount),
    )
  },
  formatLine(line) {
    return `${app.formatRank(line.rank)} ${renderRating(
      line.score,
    )}  **${line.score.toFixed(2)}**  <@${line.target}>`
  },
})

export async function userRating(user: { id: string }) {
  const { _id } = await app.getUser(user, true)

  return await table.query
    .where("to_id", _id)
    .avg({ avg: "value" })
    .count({ count: "*" })
    .then((result) => result[0])
}

export function renderRating(rating?: number) {
  const full = "▰"
  const empty = "▱"
  const round = Math.round(rating ?? 0)
  return full.repeat(round) + empty.repeat(5 - round)
}

export async function ratingEmbed(target: app.User) {
  const { count, avg } = await userRating(target)

  return new app.EmbedBuilder()
    .setAuthor({
      name: `Rating of ${target.tag}`,
      iconURL: target.displayAvatarURL(),
    })
    .setDescription(`${renderRating(avg)} **${avg?.toFixed(2) ?? 0}** / 5`)
    .setFooter({ text: `Total: ${count ?? 0} ratings` })
}
