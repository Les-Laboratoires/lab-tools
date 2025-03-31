import { Table } from "@ghom/orm"

export interface Active {
	guild_id: number
	user_id: number
}

export default new Table<Active>({
	name: "active",
	description: "Active users in a guild",
	setup: (table) => {
		table
			.integer("guild_id")
			.references("_id")
			.inTable("guild")
			.onDelete("CASCADE")
		table
			.integer("user_id")
			.references("_id")
			.inTable("user")
			.onDelete("CASCADE")
	},
})
