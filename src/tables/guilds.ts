import * as app from "../app"

export interface GuildConfig {
  id: string
  prefix: string | null
  general_channel_id: string | null
  presentation_channel_id: string | null
  member_welcome_message: string | null
  bot_welcome_message: string | null
  member_default_role: string | null
  bot_default_role: string | null
  validation_role: string | null
  log_channel_id: string | null
  member_leave_message: string | null
  bot_leave_message: string | null
  meme_channel_id: string | null
  staff_role_id: string | null
}

const table = new app.Table<GuildConfig>({
  name: "guilds",
  setup: (table) => {
    table.string("id").unique().notNullable()
    table.string("prefix")
    table.string("general_channel_id")
    table.string("presentation_channel_id")
    table.string("member_welcome_message", 2048)
    table.string("bot_welcome_message", 2048)
    table.string("member_default_role")
    table.string("bot_default_role")
    table.string("validation_role")
    table.string("log_channel_id")
    table.string("member_leave_message", 2048)
    table.string("bot_leave_message", 2048)
    table.string("meme_channel_id")
    table.string("staff_role_id")
  },
})

export default table
