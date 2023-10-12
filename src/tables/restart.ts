import * as app from "../app.js"

export interface Restart extends app.Timestamps {
  content: string
  last_channel_id: string
  last_message_id: string | null
}

export default new app.Table<Restart>({
  name: "restart",
  description: "Represent restart-message",
  migrations: {
    1: (table) => {
      table.dropColumn("created_timestamp")
      table.timestamps(true, true)
    },
  },
  setup: (table) => {
    table.string("content").notNullable()
    table.string("last_channel_id").notNullable()
    table.string("last_message_id")
    table.integer("created_timestamp", 15).notNullable().defaultTo(Date.now())
  },
})
