import { Table } from "@ghom/orm"

export interface Active {
  guild_id: number
  user_id: number
}

export default new Table<Active>({
  name: "active",
  migrations: {
    1: (table) => {
      table
        .foreign("guild_id")
        .references("_id")
        .inTable("guild")
        .onDelete("CASCADE")
      table
        .foreign("user_id")
        .references("_id")
        .inTable("user")
        .onDelete("CASCADE")
    },
  },
  setup: (table) => {
    table.integer("guild_id").references("_id").inTable("guild").notNullable()
    table.integer("user_id").references("_id").inTable("user").notNullable()
  },
})
