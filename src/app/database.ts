import Enmap from "enmap"

export const globals = new Enmap<string, any>({
  name: "globals",
})

export const scores = new Enmap<string, Score>({
  name: "scores"
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
  grammarNazi: number
  reputation: number
  helping: number
  money: number
  bite: number
  lol: number
}