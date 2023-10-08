import * as app from "../app.js"

export interface Automation {
  command: string
  period: number
  guild_id: number
  ron_at: number
}

export default new app.Table<Automation>({
  name: "automation",
  description: "The automation table",
  setup: (table) => {
    table.string("command").notNullable()
    table.integer("period").notNullable()
    table.integer("guild_id").references("_id").inTable("guild").notNullable()
    table.integer("ron_at").notNullable()
  },
})
