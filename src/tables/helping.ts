import { Table } from "#database"

export interface Helping {
  id: string
  rewarded_helper_ids: string
  resolved: boolean
  last_up: number
}

export default new Table<Helping>({
  name: "helping",
  description: "Table of helping",
  setup: (table) => {
    table.string("id").primary()
    table.string("rewarded_helper_ids").defaultTo("")
    table.boolean("resolved").defaultTo(false)
    table.bigInteger("last_up").defaultTo(0)
  },
})
