import * as app from "../app"

const table = new app.Table<{
  user_id: string
  channel_id: string
  period: string
  name: string
  content: string
}>({
  name: "cron",
  setup: (table) => {
    table
      .string("user_id")
      .index()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
    table.string("channel_id")
    table.string("period")
    table.string("content", 2048)
    table.string("name")
  },
})

export default table
