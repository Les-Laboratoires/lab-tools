import * as app from "../app.js"

export function formatRank(rank: number) {
  return `\`[ ${app.forceTextSize(rank, 3, true)} ]\``
}

export interface Ladder<Line extends { rank: number }> {
  fetchPage(options: {
    page: number
    itemCountByPage: number
    minScore: number
  }): Promise<Line[]>
  formatLine(line: Line, index: number, lines: Line[]): string
  fetchCount(minScore: number): Promise<number>
}
