import * as app from "#app"

import userTable from "#tables/user.ts"
import pointTable from "#tables/point.ts"
import noteTable from "#tables/rating.ts"

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
          .select(
            "user._id",
            "user.coins",
            "point_totals.points",
            "note_totals.rating",
          )
          .where("point_totals.points", ">", 0)
          .where("note_totals.rating", ">", 0)

        // update the coins of each user
        await userTable.query
          .insert(
            users.map((user) => ({
              _id: user._id,
              coins: Math.ceil(
                user.coins + +user.points * Math.max(1, +user.rating),
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
