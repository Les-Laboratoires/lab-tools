import * as app from "../app.js"

export interface Busy {
  channel_id: string
  user_id: string
}

export default new app.Table<Busy>({
  name: "busy",
  setup: (table) => {
    table.string("channel_id").notNullable()
    table.string("user_id").notNullable()
  },
})
