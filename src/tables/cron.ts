import * as app from "../app.js"

export interface CronData {
  user_id: string
  channel_id: string
  period: string
  name: string
  content: string
}

export default new app.Table<CronData>({
  name: "cron",
  description: "Represent saved cron",
  migrations: {
    1: (table) => table.unique(["name"]),
  },
  setup: (table) => {
    table
      .string("user_id")
      .index()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.string("channel_id").notNullable()
    table.string("period").notNullable()
    table.string("content", 2048).notNullable()
    table.string("name").notNullable()
  },
})
