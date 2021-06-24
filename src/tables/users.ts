import * as app from "../app"

const table = new app.Table<{
  id: string
  locale: string
  presentation: string
}>({
  name: "users",
  priority: 1,
  setup: (table) => {
    table.string("id").unique().notNullable()
    table.string("locale").notNullable()
    table.string("presentation", 2048)
  },
})

export default table
