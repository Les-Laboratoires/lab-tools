import * as app from "../app"

export interface Note {
  to: string
  from: string
  value: 0 | 1 | 2 | 3 | 4 | 5
}

export async function userNote({ id }: { id: string }) {
  return await table.query
    .where("to", id)
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

export async function getLadder(
  page: number,
  itemCountByPage: number,
  minNoteCount: number
): Promise<
  {
    user_id: string
    score: number
    rank: number
    note_count: number
  }[]
> {
  return app.db.raw(`
    select 
        avg(value) as score,
        count(\`from\`) as note_count,
        \`to\` as user_id,
        rank() over (
            order by avg(value) desc
        ) as rank
    from note
    group by user_id
    having note_count >= ${minNoteCount}
    order by score desc
    limit ${itemCountByPage} 
    offset ${page * itemCountByPage}
  `)
}

export async function getAvailableUsersTotal(
  minNoteCount: number
): Promise<number> {
  return app.db
    .raw(
      `
      select 
          count(\`from\`) as note_count,
          \`to\` as user_id,
          count(*) as total
      from note
      group by user_id
      having note_count >= ${minNoteCount}
    `
    )
    .then((rows) => rows[0]?.total ?? 0)
}

export default new app.Table<Note>({
  name: "note",
  setup: (table) => {
    table
      .string("to")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable()
    table
      .string("from")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable()
    table.integer("value", 1).notNullable()
  },
})
