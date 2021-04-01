import * as app from "../app"

const table = new app.Table<{
  id: string
  locale: string
  presentation: string
}>({
  name: "users",
  priority: 1,
  setup: (table) => {
    table.string("id").unique()
    table.string("locale")
    table.string("presentation", 2048).nullable()
  },
})

export default table
