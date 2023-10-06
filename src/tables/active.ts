import * as app from "../app.js"

export interface Active {
  guild_id: number
  user_id: number
}

export default new app.Table<Active>({
  name: "active",
  description: "The active members cache",
  setup: (table) => {
    table.integer("guild_id").references("_id").inTable("guild").notNullable()
    table.integer("user_id").references("_id").inTable("user").notNullable()
  },
})
