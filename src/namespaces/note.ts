import * as app from "../app.js"

import table from "../tables/note.js"

export interface NoteLadderLine {
  target: string
  score: number
  rank: number
  note_count: number
}

const mineNoteCount = 5

export const noteLadder = new app.Ladder<NoteLadderLine>({
  title: "Notes",
  async fetchLines(options) {
    return table.query
      .avg({ score: "value" })
      .count({ note_count: "from_id" })
      .select([
        "user.id as target",
        app.orm.raw("rank() over (order by avg(value) desc) as rank"),
      ])
      .leftJoin("user", "note.to_id", "user._id")
      .groupBy("user.id")
      .having(app.orm.raw("count(from_id)"), ">=", mineNoteCount)
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
        .having(app.orm.raw("count(*)"), ">=", mineNoteCount),
    )
  },
  formatLine(line) {
    return `${app.formatRank(line.rank)} ${app.graphicalNote(
      line.score,
    )}  **${line.score.toFixed(2)}**  <@${line.target}>`
  },
})

export async function userNote(user: { id: string }) {
  const { _id } = await app.getUser(user, true)

  return await table.query
    .where("to_id", _id)
    .avg({ avg: "value" })
    .count({ count: "*" })
    .then((result) => result[0])
}

export function graphicalNote(note?: number) {
  const full = "▰"
  const empty = "▱"
  const round = Math.round(note ?? 0)
  return full.repeat(round) + empty.repeat(5 - round)
}

export async function noteEmbed(target: app.User) {
  const { count, avg } = await app.userNote(target)

  return new app.EmbedBuilder()
    .setAuthor({
      name: `Note of ${target.tag}`,
      iconURL: target.displayAvatarURL(),
    })
    .setDescription(`${app.graphicalNote(avg)} **${avg?.toFixed(2) ?? 0}** / 5`)
    .setFooter({ text: `Total: ${count ?? 0} notes` })
}
