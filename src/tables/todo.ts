import * as app from "../app"

const table = new app.Table<{
  user_id: string
  content: string
}>({
  name: "todo",
  setup: (table) => {
    table.string("user_id").index().references("id").inTable("user")
    table.string("content")
    table.foreign("user_id").references("users.").onDelete("CASCADE")
  },
})

export default table
