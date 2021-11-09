import * as app from "../app.js"

export interface ReactionRole {
  guild_id: string
  role_id: string
}

export default new app.Table<ReactionRole>({
  name: "rero",
  description: "Represent a reaction-role",
  setup: (table) => {
    table.string("guild_id").notNullable()
    table.string("role_id").unique().notNullable()
  },
})
