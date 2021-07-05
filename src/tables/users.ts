import * as app from "../app"

export interface LabUser {
  id: string
  presentation: string
}

const table = new app.Table<LabUser>({
  name: "users",
  priority: 1,
  setup: (table) => {
    table.string("id").unique().notNullable()
    table.string("presentation", 2048)
  },
})

export default table
