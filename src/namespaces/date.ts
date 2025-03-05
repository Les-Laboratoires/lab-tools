import { Knex } from "knex"
import orm from "#core/database"
import { duration } from "tims"

export function addCreatedAt(table: Knex.CreateTableBuilder) {
  table
    .datetime("created_at", {
      useTz: true,
    })
    .defaultTo(orm.database.fn.now())
}

export function formatDuration(from: string) {
  return duration(new Date(from).getTime() - Date.now(), {
    format: "ms",
    maxPartCount: 3,
  })
    .replace(/(?:millièmes? de seconde|thousandths? of (?:a )?second)/, "ms")
    .replace(/(\d+)/g, "**$1**")
}
