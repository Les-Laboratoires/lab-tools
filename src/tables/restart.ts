import { Table } from "@ghom/orm"

import { addCreatedAt } from "../namespaces/date.ts"

export interface Restart {
  content: string
  last_channel_id: string
  last_message_id: string | null
  created_at: string
}

export default new Table<Restart>({
  name: "restart",
  description: "Restart message for the deploy command",
  setup: (table) => {
    table.string("content").notNullable()
    table.string("last_channel_id").notNullable()
    table.string("last_message_id")
    addCreatedAt(table)
  },
})
