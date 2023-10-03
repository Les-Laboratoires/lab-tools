import * as app from "../app.js"

// import users from "./user"

export interface Note {
  to: number
  from: number
  value: 0 | 1 | 2 | 3 | 4 | 5
}

const table = new app.Table<Note>({
  name: "note",
  description: "Represent a user note",
  setup: (table) => {
    table
      .integer("to")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table
      .integer("from")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.integer("value", 1).notNullable()
  },
})

export async function userNote(user: { id: string }) {
  const { _id } = await app.getUser(user, true)

  return await table.query
    .where("to", _id)
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
  const data = await app.db.raw(`
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

  for (const row of data) {
    const user = await app.getUser(row.user_id, true)

    row.user_id = user.id
  }

  return data
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

export default table
