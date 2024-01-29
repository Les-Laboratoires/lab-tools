import * as app from "../app.js"

export interface ActiveConfig {
  _id: number
  /**
   * In hours
   */
  active_period: `${number}`
  active_message_count: `${number}`
}

export default new app.Table<ActiveConfig>({
  name: "activeConfig",
  setup: (table) => {
    table.increments("_id", { primaryKey: true }).unsigned()
    table.string("active_period").notNullable()
    table.string("active_message_count").notNullable()
  },
  then: async (table) => {
    await table.query.insert([
      // 10 messages in one day
      {
        active_period: `${24}`,
        active_message_count: `${10}`,
      },
      // 60 messages in one week
      {
        active_period: `${24 * 7}`,
        active_message_count: `${60}`,
      },
      // 150 messages in one month
      {
        active_period: `${24 * 7 * 4}`,
        active_message_count: `${150}`,
      },
      // 500 messages in one year
      {
        active_period: `${24 * 365}`,
        active_message_count: `${500}`,
      },
    ])
  },
})
