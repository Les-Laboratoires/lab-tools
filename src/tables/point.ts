import * as app from "../app.js"

export interface Point extends app.Timestamps {
  to_id: number
  from_id: number
  amount: number
}

export default new app.Table<Point>({
  name: "point",
  description: "The point table",
  migrations: {
    1: (table) => {
      table.dropColumn("created_timestamp")
      table.timestamps(true, true)
    },
  },
  setup: (table) => {
    table
      .integer("to_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table
      .integer("from_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table.integer("amount").unsigned().notNullable()
    table.integer("created_timestamp", 15).notNullable().defaultTo(Date.now())
  },
})

const leaderboardPattern = `
  WITH Leaderboard AS (
    SELECT
      u.id AS member_id,
      SUM(p.amount) AS score
    FROM user u
    LEFT JOIN point p ON u._id = p.to_id
    WHERE score > 0
    GROUP BY u.id
    ORDER BY score DESC
  )
`

const userRankPattern = `
  SELECT
    member_id,
    score,
    RANK() OVER (ORDER BY score DESC) AS rank
  FROM Leaderboard
`

export async function getLeaderboard(): Promise<
  {
    member_id: string
    score: number
    rank: number
  }[]
> {
  return app.db.raw(`
    ${leaderboardPattern}
    SELECT
      member_id,
      score,
      RANK() OVER (ORDER BY score DESC) AS rank
    FROM Leaderboard
    LIMIT 20;
  `)
}

export async function getPersonalRank(memberId: string): Promise<{
  score: number
  rank: number
}> {
  return app.db.raw(`
    ${leaderboardPattern},
    UserRank AS (
      ${userRankPattern}
    )
    SELECT
      score,
      rank
    FROM UserRank
    WHERE member_id = '${memberId}';
  `)
}
