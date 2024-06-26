import { Table } from "@ghom/orm"

import { addCreatedAt } from "../namespaces/date.ts"

export interface Point {
  to_id: number
  from_id: number
  amount: number
  created_at: string
}

export default new Table<Point>({
  name: "point",
  setup: (table) => {
    table
      .integer("to_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table
      .integer("from_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.integer("amount").unsigned().notNullable()
    addCreatedAt(table)
  },
})
