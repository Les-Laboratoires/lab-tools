import * as app from "#app"

import userTable from "#tables/user.ts"
import pointTable from "#tables/point.ts"
import noteTable from "#tables/rating.ts"
import messageTable from "#tables/message.ts"

const listener: app.Listener<"afterReady"> = {
  event: "afterReady",
  description: "Gain coins hourly according to the user's points & ratings",
  async run() {
    setInterval(
      async () => {
        // get all users with points and ratings from a join query.
        const users: {
          _id: number
          coins: number
          points: `${number}`
          rating: `${number}`
          givenNotes: `${number}`
          active: number | null
          messages: number
        }[] = await userTable.query
          .leftJoin(
            pointTable.query
              .select("to_id")
              .sum("amount as points")
              .groupBy("to_id")
              .as("point_totals"),
            "point_totals.to_id",
            "user._id",
          )
          .leftJoin(
            noteTable.query
              .select("to_id")
              .avg("value as rating")
              .groupBy("to_id")
              .as("note_totals"),
            "note_totals.to_id",
            "user._id",
          )
          .leftJoin(
            noteTable.query
              .select("from_id")
              .count("* as givenNotes")
              .groupBy("from_id")
              .as("note_totals"),
            "note_totals.from_id",
            "user._id",
          )
          .leftJoin("active", "active.user_id", "user._id")
          .leftJoin(
            messageTable.query
              .select("author_id")
              .count("* as messages")
              .groupBy("author_id")
              .as("message_totals"),
            "message_totals.author_id",
            "user._id",
          )
          .select(
            "user._id",
            "user.coins",
            "point_totals.points",
            "note_totals.rating",
            "active.user_id as active",
            "message_totals.messages",
          )
          .where("point_totals.points", ">", 0)
          .or.where("note_totals.rating", ">", 0)
          .or.where("note_totals.givenNotes", ">", 0)
          .or.where("message_totals.messages", ">", 0)
          .or.where("active.user_id", "is not", null)

        // update the coins of each user
        await userTable.query
          .insert(
            users.map((user) => ({
              _id: user._id,
              coins: Math.ceil(
                user.coins +
                  +user.points * Math.max(1, +user.rating) +
                  +user.givenNotes * 5 +
                  (user.active
                    ? Math.max(10, Math.floor(user.messages * 0.001))
                    : 0),
              ),
            })),
          )
          .onConflict("_id")
          .merge()
      },
      1000 * 60 * 60,
    )
  },
}

export default listener
