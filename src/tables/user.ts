import * as app from "../app.js"

export interface User {
  _id: number
  id: string
}

export default new app.Table<User>({
  name: "user",
  priority: 10,
  setup: (table) => {
    table.increments("_id", { primaryKey: true })
    table.string("id").unique().notNullable()
  },
})
