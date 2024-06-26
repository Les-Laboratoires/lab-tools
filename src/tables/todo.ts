import { Table } from "@ghom/orm"

import { addCreatedAt } from "../namespaces/date.ts"

export interface ToDo {
  _id: number
  user_id: number
  content: string
  created_at: Date
}

export default new Table<ToDo>({
  name: "todo",
  migrations: {
    1: (table) => {
      addCreatedAt(table)
    },
  },
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
