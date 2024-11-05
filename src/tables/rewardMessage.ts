import { Table } from "#database"

export interface RewardMessage {
  _id: number
  reward_id: number
  message_url: string
  delete_at: Date
  usages: number
}

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/use-database guide} for more information.
 */
export default new Table<RewardMessage>({
  name: "rewardMessage",
  description: "Represent the announce message of the reward",
  setup: (table) => {
    table.increments("_id").primary()
    table.integer("reward_id").unsigned().references("_id").inTable("reward")
    table.string("message_url").notNullable()
    table
      .datetime("delete_at", {
        useTz: true,
      })
      .notNullable()
    table.integer("usages").defaultTo(1)
  },
})
