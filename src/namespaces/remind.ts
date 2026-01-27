import { CachedQuery } from "@ghom/query"

import client from "#core/client"

import remindTable from "#tables/remind"
import userTable from "#tables/user"

const allRemindId = "all reminders"

/**
 * Cache for all reminds refreshed every 6 hours
 */
export const allRemindCache = new CachedQuery(
	() => {
		return remindTable.query.select()
	},
	1000 * 60 * 60 * 6,
)

export async function checkReminds() {
	const reminds = await allRemindCache.get(allRemindId)

	for (const remind of reminds) {
		if (remind.remind_at <= Date.now()) {
			// Send remind and delete it from database
			const user = await userTable.query.where("_id", remind.user_id).first()

			if (user) {
				const dm = await client.users.createDM(user.id)
				await dm.send(`## Reminder:\n${remind.message}`)
			}

			await remindTable.query.where("_id", remind._id).delete()

			allRemindCache.invalidate()
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

	allRemindCache.invalidate()
}
