import * as app from "../app.js"

import table from "../tables/note.js"

export interface NoteLadderLine {
  target: string
  score: number
  rank: number
  note_count: number
}

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

export async function getNoteLadder(options: {
  page: number
  itemCountByPage: number
  minNoteCount: number
}): Promise<NoteLadderLine[]> {
  const data = await app.orm.raw(`
    select
        avg(value) as score,
        count(from_id) as note_count,
        rank() over (
            order by avg(value) desc
        ) as rank,
        user.id as target
    from note
    left join user on note.to_id = user._id
    group by to_id
    having note_count >= ${options.minNoteCount}
    order by score desc
    limit ${options.itemCountByPage}
    offset ${options.page * options.itemCountByPage}
  `)

  for (const row of data) {
    const user = await app.getUser(row.user_id, true)

    row.user_id = user.id
  }

  return data
}

export function formatNoteLadderLine(line: NoteLadderLine) {
  return `${app.formatRank(line.rank)} ${app.graphicalNote(
    line.score
  )}  **${line.score.toFixed(2)}**  <@${line.target}>`
}

export async function getNoteLadderAvailableUsersTotal(
  minNoteCount: number
): Promise<number> {
  return app.orm
    .raw(
      `
      select 
          count(\`from_id\`) as note_count,
          \`to_id\` as user_id,
          count(*) as total
      from note
      group by user_id
      having note_count >= ${minNoteCount}
    `
    )
    .then((rows: any) => rows[0]?.total ?? 0)
}

export async function noteEmbed(target: app.User) {
  const { count, avg } = await app.userNote(target)

  return new app.MessageEmbed()
    .setAuthor({
      name: `Note of ${target.tag}`,
      iconURL: target.displayAvatarURL({ dynamic: true }),
    })
    .setDescription(`${app.graphicalNote(avg)} **${avg?.toFixed(2) ?? 0}** / 5`)
    .setFooter({ text: `Total: ${count ?? 0} notes` })
}
