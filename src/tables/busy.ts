import * as app from "../app"

export interface Busy {
  channel_id: string
  user_id?: string
}

const table = new app.Table<Busy>({
  name: "busy",
  setup: (table) => {
    table.string("channel_id").notNullable()
    table.string("user_id")
  },
})

export default table
