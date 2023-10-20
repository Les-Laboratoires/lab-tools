import * as app from "../app.js"

export interface PointLadderLine {
  target: string
  score: number
  rank: number
}

export const pointLadder: app.Ladder<PointLadderLine> = {
  async fetchPage(options) {
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
  },
  async fetchCount() {
    return app.orm
      .raw(
        `select
        count(distinct to_id) as total
      from point`
      )
      .then((rows: any) => rows[0]?.total ?? 0)
  },
  formatLine(line, index, lines) {
    return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
      String(line.score),
      Math.max(...lines.map((l) => l.score)).toString().length
    )}\` pts - <@${line.target}>`
  },
}
