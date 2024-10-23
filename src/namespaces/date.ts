import { Knex } from "knex"
import * as app from "#app"

export function addCreatedAt(table: Knex.CreateTableBuilder) {
  table
    .datetime("created_at", {
      useTz: true,
    })
    .defaultTo(app.database.database.fn.now())
}

export function formatDuration(from: string) {
  return app
    .duration(new Date(from).getTime() - Date.now(), {
      format: "ms",
      maxPartCount: 3,
    })
    .replace(/(?:millièmes? de seconde|thousandths? of (?:a )?second)/, "ms")
    .replace(/(\d+)/g, "**$1**")
}
