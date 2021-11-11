import * as app from "../app.js"

export interface LabUser {
  id: string
  presentation_id: string | null
  presentation_guild_id: string | null
}

export default new app.Table<LabUser>({
  name: "users",
  description: "Represent a lab user",
  priority: 1,
  migrations: {
    2: (table) => table.renameColumn("presentation", "presentation_id"),
    3: (table) => table.string("presentation_guild_id"),
  },
  setup(table) {
    table.string("id").unique().notNullable()
    table.string("presentation", 2048)
  },
})
