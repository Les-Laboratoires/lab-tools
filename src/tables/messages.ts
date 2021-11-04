import * as app from "../app.js"

export interface Messages {
  author_id: string
  channel_id: string
  count: number
}

export default new app.Table<Messages>({
  name: "messages",
  description: "Channel messages count by author",
  setup: (table) => {
    table.string("author_id").notNullable()
    table.string("channel_id").notNullable()
    table.integer("count").defaultTo(1)
  },
})
