import * as app from "../app.js"

export function formatRank(rank: number) {
  return `\`[ ${app.forceTextSize(rank, 3, true)} ]\``
}
