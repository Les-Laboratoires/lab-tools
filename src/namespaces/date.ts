import { Knex } from "knex"
import * as app from "../app.js"

export function addCreatedAt(table: Knex.CreateTableBuilder) {
  table
    .datetime("created_at", {
      useTz: true,
    })
    .defaultTo(app.orm.database.fn.now())
}
