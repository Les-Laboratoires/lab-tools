import type { Knex } from "knex"
import { duration } from "tims"
import orm from "#core/database"

export function addCreatedAt(table: Knex.CreateTableBuilder) {
	table
		.datetime("created_at", {
			useTz: true,
		})
		.defaultTo(orm.client.fn.now())
}

export function formatDuration(from: string) {
	return duration(new Date(from).getTime() - Date.now(), {
		format: "ms",
		maxPartCount: 3,
	})
		.replace(/(?:millièmes? de seconde|thousandths? of (?:a )?second)/, "ms")
		.replace(/(\d+)/g, "**$1**")
}
