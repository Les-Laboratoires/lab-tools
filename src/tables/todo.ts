import * as app from "../app"

export interface ToDo {
  id: number
  user_id: string
  content: string
}

const table = new app.Table<ToDo>({
  name: "todo",
  setup: (table) => {
    table.increments("id").primary().unsigned()
    table
      .string("user_id")
      .index()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.string("content", 2048).notNullable()
  },
})

export default table
