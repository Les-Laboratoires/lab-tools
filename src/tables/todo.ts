import * as app from "../app"

const table = new app.Table<{
  id: number
  user_id: string
  content: string
}>({
  name: "todo",
  setup: (table) => {
    table.increments("id").primary().unsigned()
    table
      .string("user_id")
      .index()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
    table.string("content", 2048)
  },
})

export default table
