import { Table } from "@ghom/orm"

export interface Lab {
	guild_id: number
	url: string
	title: string
	ignored: boolean
}

export default new Table<Lab>({
	name: "labs",
	description: "Laboratory list",
	migrations: {
		1: (table) => {
			table.unique(["guild_id"])
		},
		2: (table) => {
			table.boolean("ignored").defaultTo(false)
		},
	},
	setup: (table) => {
		table
			.integer("guild_id")
			.references("_id")
			.inTable("guild")
			.onDelete("CASCADE")
			.notNullable()
		table.string("url").notNullable()
		table.string("title").notNullable()
	},
})
