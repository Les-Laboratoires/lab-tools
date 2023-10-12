import * as app from "../app.js"

export interface Point extends app.Timestamps {
  to_id: number
  from_id: number
  amount: number
}

export default new app.Table<Point>({
  name: "point",
  description: "The point table",
  migrations: {
    1: (table) => {
      table.dropColumn("created_timestamp")
      table.timestamps(true, true)
    },
  },
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
    table.integer("created_timestamp", 15).notNullable().defaultTo(Date.now())
  },
})
