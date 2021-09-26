import * as app from "../app.js"

export interface GuildConfig {
  id: string
  prefix: string | null
  reward_emoji_id: string | null
  reward_channel_id: string | null
  general_channel_id: string | null
  project_channel_id: string | null
  affiliation_channel_id: string | null
  presentation_channel_id: string | null
  member_welcome_message: string | null
  bot_welcome_message: string | null
  member_default_role_id: string | null
  bot_default_role_id: string | null
  validation_role_id: string | null
  log_channel_id: string | null
  member_leave_message: string | null
  bot_leave_message: string | null
  meme_channel_id: string | null
  staff_role_id: string | null
  help_room_pattern: string | null
  elders_role_pattern: string | null
}

export default new app.Table<GuildConfig>({
  name: "guilds",
  description: "Represent a guild config",
  setup: (table) => {
    table.string("id").unique().notNullable()
    table.string("prefix")
    table.string("reward_emoji_id")
    table.string("member_default_role_id")
    table.string("bot_default_role_id")
    table.string("validation_role_id")
    table.string("staff_role_id")
    table.string("log_channel_id")
    table.string("meme_channel_id")
    table.string("reward_channel_id")
    table.string("project_channel_id")
    table.string("general_channel_id")
    table.string("affiliation_channel_id")
    table.string("presentation_channel_id")
    table.string("member_welcome_message", 2048)
    table.string("member_leave_message", 2048)
    table.string("bot_welcome_message", 2048)
    table.string("bot_leave_message", 2048)
    table.string("help_room_pattern")
    table.string("elders_role_pattern")
  },
})
