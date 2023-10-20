import * as app from "../app.js"

export interface PointLadderLine {
  target: string
  score: number
  rank: number
}

export async function getPointLadder(options: {
  page: number
  itemCountByPage: number
}): Promise<
  {
    target: string
    score: number
    rank: number
  }[]
> {
  return app.orm.raw(`
    select
        sum(amount) as score,
        rank() over (
            order by sum(amount) desc
        ) as rank,
        user.id as target
    from point
    left join user on point.to_id = user._id
    group by to_id
    order by score desc
    limit ${options.itemCountByPage}
    offset ${options.page * options.itemCountByPage}
  `)
}

export function formatPointLadderLine(
  line: PointLadderLine,
  index: number,
  lines: PointLadderLine[]
) {
  return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
    String(line.score),
    Math.max(...lines.map((l) => l.score)).toString().length
  )}\` pts - <@${line.target}>`
}

export async function getPointLadderAvailableUsersTotal(): Promise<number> {
  return app.orm
    .raw(
      `select
        count(distinct to_id) as total
      from point`
    )
    .then((rows: any) => rows[0]?.total ?? 0)
}
