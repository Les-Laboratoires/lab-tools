import Enmap from "enmap"

export const cache = new Enmap<string, any>()

export const globals = new Enmap<string, any>({
  name: "globals",
})

export const scores = new Enmap<string, Score>({
  name: "scores",
})

export const counters = new Enmap<string, Counter>({
  name: "counters",
})

export const snippets = new Enmap<string, string>({
  name: "snippets",
})

export const coolDowns = new Enmap<string, CoolDown>()

// /** Enmap[Guild, Prefix] */
// export const prefixes = new Enmap<Discord.Snowflake, string>({
//   name: "prefixes",
// })
//
// /** Enmap[Guild, Member[]] */
// export const muted = new Enmap<Discord.Snowflake, Discord.Snowflake[]>({
//  name: "muted"
// })

export interface CoolDown {
  time: number
  trigger: boolean
}

export interface Score {
  [key: string]: number
}

export interface Counter {
  target: string
  name: string
  type: "match" | "react"
}
