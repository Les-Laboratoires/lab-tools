import { Knex } from "knex"
import * as app from "../app.js"

export const now = sqlDateColumn("'now'")

export function sqlPast(period: number) {
  return `${now} - datetime(${period / 1000}, 'unixepoch', 'localtime')`
}

export function sqlFuture(period: number) {
  return `${now} + datetime(${period / 1000}, 'unixepoch', 'localtime')`
}

export function sqlDateColumn(column: "created_at" | "'now'") {
  return `datetime(${column}, 'localtime')`
}

export function addCreatedAt(table: Knex.CreateTableBuilder) {
  table
    .datetime("created_at", {
      useTz: true,
    })
    .defaultTo(app.orm.raw(now))
}
