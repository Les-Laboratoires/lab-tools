import * as app from "../app.js"

export interface ToDo {
  _id: number
  user_id: number
  content: string
}

export default new app.Table<ToDo>({
  name: "todo",
  setup: (table) => {
    table.increments("_id", { primaryKey: true }).unsigned()
    table
      .integer("user_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.string("content", 2048).notNullable()
  },
})
