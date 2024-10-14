import * as app from "#app"

import remindTable from "#tables/remind.ts"
import userTable from "#tables/user.ts"

/**
 * Cache for all reminds refreshed every 6 hours
 */
export const allRemindCache = new app.ResponseCache(
  () => {
    return remindTable.query.select()
  },
  1000 * 60 * 60 * 6,
)

export async function checkReminds() {
  const reminds = await allRemindCache.get()

  for (const remind of reminds) {
    if (remind.remind_at <= Date.now()) {
      // Send remind and delete it from database
      const user = await userTable.query.where("_id", remind.user_id).first()

      if (user) {
        const dm = await app.client.users.createDM(user.id)
        await dm.send(`## Reminder:\n${remind.message}`)
      }

      await remindTable.query.where("_id", remind._id).delete()
      await allRemindCache.fetch()
    }
  }
}

export async function addRemind(
  user_id: number,
  message: string,
  remind_at: number,
) {
  await remindTable.query.insert({
    user_id,
    message,
    remind_at,
  })

  await allRemindCache.fetch()
}
