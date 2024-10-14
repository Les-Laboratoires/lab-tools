import { Table } from "#database"

export interface Remind {
  _id: number
  user_id: number
  message: string
  /**
   * JS timestamp (ms)
   */
  remind_at: number
}

export default new Table<Remind>({
  name: "remind",
  description: "Table of remind",
  setup: (table) => {
    table.increments("_id", { primaryKey: true })
    table
      .integer("user_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.text("message").notNullable()
    table.bigInteger("remind_at").unsigned().notNullable()
  },
})
