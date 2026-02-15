import { Table } from "@ghom/orm"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/use-database database guide} for more information.
 */
export default new Table({
	name: "youtube",
	description: "YouTube channels to watch for NEWS",
	columns: (table) => ({
		_id: table.increments().primary(),
		guild_id: table
			.integer()
			.references("_id")
			.inTable("guild")
			.onDelete("CASCADE"),
		channel_name: table.string().nullable(),
		channel_url: table.string().unique().nullable(),
		playlist_name: table.string().nullable(),
		playlist_url: table.string().unique().nullable(),
	}),
})
