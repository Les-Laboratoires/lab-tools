import { Table } from "@ghom/orm"

export interface Rating {
  to_id: number
  from_id: number
  guild_id: number
  value: 0 | 1 | 2 | 3 | 4 | 5
}

export default new Table<Rating>({
  name: "note",
  description: "Rating of a user by another user",
  migrations: {
    1: (table) => {
      table.renameColumn("to", "to_id")
      table.renameColumn("from", "from_id")
    },
    2: (table) => {
      table
        .integer("guild_id")
        .references("_id")
        .inTable("guild")
        .onDelete("CASCADE")
        .nullable()
    },
  },
  setup: (table) => {
    table
      .integer("to")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table
      .integer("from")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.integer("value", 1).notNullable()
  },
})
