import { Table } from "@ghom/orm"

export interface User {
  _id: number
  id: string
  is_bot: boolean
}

export default new Table<User>({
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
