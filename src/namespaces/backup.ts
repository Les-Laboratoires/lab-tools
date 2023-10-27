import fs from "fs/promises"
import * as app from "../app.js"

export async function createBackup() {
  await fs.cp(
    app.util.rootPath("data", "sqlite3.db"),
    app.util.rootPath("data", "sqlite3.db.backup"),
    {
      force: true,
    },
  )
}

export async function restoreBackup() {
  await fs.cp(
    app.util.rootPath("data", "sqlite3.db.backup"),
    app.util.rootPath("data", "sqlite3.db"),
    {
      force: true,
    },
  )
}
