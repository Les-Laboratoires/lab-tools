import * as app from "../app.js"

export interface LabUser {
  id: string
  presentation: string | null
}

export default new app.Table<LabUser>({
  name: "users",
  description: "Represent an user",
  priority: 1,
  setup: (table) => {
    table.string("id").unique().notNullable()
    table.string("presentation", 2048)
  },
})
