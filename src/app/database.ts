import knex from "knex"
import { Knex } from "knex"
import chalk from "chalk"
import path from "path"
import * as logger from "./logger"

/**
 * Welcome to the database file!
 * You can get the docs of **knex** [here](http://knexjs.org/)
 */

export const db = knex({
  client: "pg",
  useNullAsDefault: true,
  connection: {
    port: +(process.env.PORT ?? 5432),
    host: process.env.HOST ?? "localhost",
    user: process.env.USER ?? "postgres",
    password: process.env.PASSWORD,
    database: process.env.DATABASE ?? "postgres",
  },
})

export interface TableOptions {
  name: string
  colMaker: (table: Knex.CreateTableBuilder) => void
}

export class Table<Type> {
  constructor(public readonly options: TableOptions) {}

  get query() {
    return db<Type>(this.options.name)
  }

  async make(): Promise<this> {
    try {
      await db.schema.createTable(this.options.name, this.options.colMaker)
      logger.log(`created table ${chalk.blue(this.options.name)}`, "database")
    } catch (error) {
      logger.log(`loaded table ${chalk.blue(this.options.name)}`, "database")
    }
    return this
  }
}

export const tablesPath =
  process.env.TABLES_PATH ?? path.join(process.cwd(), "dist", "tables")

export const tables = new Map<string, Table<any>>()
