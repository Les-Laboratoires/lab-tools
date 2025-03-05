import { Table } from "@ghom/orm"

export interface Helping {
  id: string
  rewarded_helper_ids: string
  resolved: boolean
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
  migrations: [(builder) => builder.dropColumn("last_up")],
})
