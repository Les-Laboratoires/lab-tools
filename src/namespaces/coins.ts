import userTable from "#tables/user.ts"
import pointTable from "#tables/point.ts"
import noteTable from "#tables/rating.ts"
import messageTable from "#tables/message.ts"

export async function giveHourlyCoins() {
  // get all users with points and ratings from a join query.
  const users: {
    _id: number
    coins: number
    points: `${number}`
    rating: `${number}`
    givenNotes: `${number}`
    active: `${string}` | null
    messages: `${number}`
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
        .as("notes"),
      "notes.to_id",
      "user._id",
    )
    .leftJoin(
      noteTable.query
        .select("from_id")
        .count({ total: "*" })
        .groupBy("from_id")
        .as("given_notes"),
      "given_notes.from_id",
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
      "notes.rating",
      "given_notes.total as givenNotes",
      "active.user_id as active",
      "message_totals.messages",
    )
    .where("point_totals.points", ">", 0)
    .or.where("notes.rating", ">", 0)
    .or.where("given_notes.total", ">", 0)
    .orWhere((query) =>
      query
        .where("active.user_id", "is not", null)
        .andWhere("message_totals.messages", ">", 0),
    )
    // Ajout de GROUP BY pour éviter les doublons
    .groupBy(
      "user._id",
      "user.coins",
      "point_totals.points",
      "notes.rating",
      "given_notes.total",
      "active.user_id",
      "message_totals.messages",
    )

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
              ? Math.max(10, Math.floor(+user.messages * 0.001))
              : 0),
        ),
      })),
    )
    .onConflict("_id")
    .merge(["coins"])
}
