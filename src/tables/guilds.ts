import * as app from "../app"

const table = new app.Table<{
  id: string
  prefix: string | null
  general_channel_id: string | null
  presentation_channel_id: string | null
  member_welcome_message: string | null
  bot_welcome_message: string | null
  member_default_role: string | null
  bot_default_role: string | null
}>({
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
  },
})

export default table
