import { Knex } from "knex"
import * as app from "#app"

export function addCreatedAt(table: Knex.CreateTableBuilder) {
  table
    .datetime("created_at", {
      useTz: true,
    })
    .defaultTo(app.database.database.fn.now())
}
