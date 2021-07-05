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

const table = new app.Table<Note>({
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

export default table
