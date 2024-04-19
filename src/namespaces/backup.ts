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

export async function restoreBackup(onSuccess: () => unknown) {
  // disable error handling
  console.error = () => {}

  await app.orm.database.destroy()

  await fs.cp(
    app.util.rootPath("data", "sqlite3.db.backup"),
    app.util.rootPath("data", "sqlite3.db"),
    {
      force: true,
    },
  )

  await onSuccess()

  process.exit(0)
}
