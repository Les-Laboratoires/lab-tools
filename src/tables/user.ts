import { Table } from "@ghom/orm"

export interface User {
	_id: number
	id: string
	coins: number
	is_bot: boolean
	presentation_id: string | null
	presentation_guild_id: string | null
}

export default new Table<User>({
	name: "user",
	description: "User data",
	priority: 10,
	migrations: {
		1: (table) => table.boolean("is_bot").defaultTo(false),
		2: (table) => table.integer("coins").unsigned().defaultTo(0),
		3: (table) => {
			table.string("presentation_id")
			table.string("presentation_guild_id")
		},
	},
	setup: (table) => {
		table.increments("_id", { primaryKey: true })
		table.string("id").unique().notNullable()
	},
})
