import * as app from "../app.js"

export interface Restart {
  content: string
  last_channel_id: string
  last_message_id: string | null
  created_timestamp: number
}

export default new app.Table<Restart>({
  name: "restart",
  description: "Represent restart-message",
  migrations: {
    2: (table) =>
      table
        .integer("created_timestamp", 15)
        .notNullable()
        .defaultTo(Date.now()),
  },
  setup: (table) => {
    table.string("content").notNullable()
    table.string("last_channel_id").notNullable()
    table.string("last_message_id")
  },
})
