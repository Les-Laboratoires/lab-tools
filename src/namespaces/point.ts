import * as app from "../app.js"

export interface PointLadderLine {
  target: string
  score: number
  rank: number
}

export const pointLadder = new app.Ladder<PointLadderLine>({
  title: "Helpers",
  async fetchLines(options) {
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
      having user.is_bot = false
      order by score desc
      limit ${options.pageLineCount}
      offset ${options.pageIndex * options.pageLineCount}
    `)
  },
  async fetchLineCount() {
    return app.orm
      .raw(
        `select
          count(distinct to_id) as total
        from point
        left join user on point.to_id = user._id
        having user.is_bot = false`,
      )
      .then((rows: any) => rows[0]?.total ?? 0)
  },
  formatLine(line, index, lines) {
    return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
      String(line.score),
      Math.max(...lines.map((l) => l.score)).toString().length,
    )}\` pts - <@${line.target}>`
  },
})
