export function sqlPast(period: number) {
  return `datetime('now', 'localtime') - datetime(${
    period / 1000
  }, 'unixepoch', 'localtime')`
}

export function sqlFuture(period: number) {
  return `datetime('now', 'localtime') + datetime(${
    period / 1000
  }, 'unixepoch', 'localtime')`
}

export function sqlDateColumn(column: "created_at" | "updated_at") {
  return `datetime(${column}, 'localtime')`
}
