import * as app from "../app.js"

export interface User {
  _id: number
  id: string
  is_bot: boolean
}

export default new app.Table<User>({
  name: "user",
  priority: 10,
  migrations: {
    1: (table) => table.boolean("is_bot").defaultTo(false),
  },
  setup: (table) => {
    table.increments("_id", { primaryKey: true })
    table.string("id").unique().notNullable()
  },
})
