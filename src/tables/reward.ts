import { Table } from "#database"

export interface Reward {
  _id: number
  name: string
  url: string | null
  expires_at: Date
}

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/use-database guide} for more information.
 */
export default new Table<Reward>({
  name: "reward",
  description: "Table of reward",
  setup: (table) => {
    table.increments("_id").primary()
    table.string("name").notNullable()
    table.string("url")
    table
      .datetime("expires_at", {
        useTz: true,
      })
      .notNullable()
  },
})
