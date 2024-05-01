import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

import "dotenv/config.js"

for (const key of ["BOT_TOKEN", "BOT_PREFIX", "BOT_OWNER", "BOT_ID"]) {
  if (!process.env[key] || /^{{.+}}$/.test(process.env[key] as string)) {
    throw new Error(`You need to add "${key}" value in your .env file.`)
  }
}

const app = await import("#app")

try {
  await app.orm.init()
  await app.initConfig()
  await app.commandHandler.init()
  await app.slashCommandHandler.init()
  await app.listenerHandler.init()
  await app.initPagination()
  await app.checkUpdates()
  await app.ClientSingleton.get().login(process.env.BOT_TOKEN)
} catch (error: any) {
  app.error(error, __filename, true)
  process.exit(1)
}
