import * as app from "../app"

const table = new app.Table<{
  id: string
  presentation: string
}>({
  name: "users",
  priority: 1,
  setup: (table) => {
    table.string("id").unique()
    table.string("presentation").nullable()
  },
})

export default table
