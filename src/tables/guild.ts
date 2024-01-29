import * as app from "../app.js"

export interface Guild {
  _id: number
  id: string
  prefix: string | null
  general_channel_id: string | null
  project_channel_id: string | null
  affiliation_channel_id: string | null
  member_tracker_channel_id: string | null
  message_tracker_channel_id: string | null
  online_tracker_channel_id: string | null
  member_welcome_message: string | null
  bot_welcome_message: string | null
  member_role_id: string | null
  bot_role_id: string | null
  active_role_id: string | null
  log_channel_id: string | null
  member_leave_message: string | null
  bot_leave_message: string | null
  meme_channel_id: string | null
  staff_role_id: string | null
  elders_role_pattern: string | null
  member_tracker_pattern: string
  message_tracker_pattern: string
  online_tracker_pattern: string
  active_refresh_interval: `${number}`
}

export default new app.Table<Guild>({
  name: "guild",
  priority: 10,
  migrations: {
    1: (table) => {
      table.string("member_tracker_channel_id")
      table.string("message_tracker_channel_id")
      table.string("online_tracker_channel_id")
      table.string("member_tracker_pattern").defaultTo("📈｜$n membres")
      table.string("message_tracker_pattern").defaultTo("📨｜$n messages")
      table.string("online_tracker_pattern").defaultTo("🟢｜$n connectés")
    },
    2: (table) => {
      table.string("active_period").defaultTo(String(24 * 7 * 3)) // 3 weeks
      table.string("active_message_count").defaultTo(String(50))
    },
    3: (table) => {
      table.string("active_refresh_interval").defaultTo(String(2)) // 2 hours
    },
    4: (table) => {
      table.dropColumns("active_period", "active_message_count")
    },
  },
  setup: (table) => {
    table.increments("_id", { primaryKey: true }).unsigned()
    table.string("id").unique().notNullable()
    table.string("prefix")
    table.string("member_role_id")
    table.string("bot_role_id")
    table.string("active_role_id")
    table.string("staff_role_id")
    table.string("log_channel_id")
    table.string("meme_channel_id")
    table.string("project_channel_id")
    table.string("general_channel_id")
    table.string("affiliation_channel_id")
    table.string("member_welcome_message", 2048)
    table.string("member_leave_message", 2048)
    table.string("bot_welcome_message", 2048)
    table.string("bot_leave_message", 2048)
    table.string("elders_role_pattern")
  },
})
