import Enmap from "enmap"

export const globals = new Enmap<string, any>({
  name: "globals",
})

export const coolDowns = new Enmap<string, { time: number; trigger: boolean }>()

// /** Enmap[Guild, Prefix] */
// export const prefixes = new Enmap<Discord.Snowflake, string>({
//   name: "prefixes",
// })
//
// /** Enmap[Guild, Member[]] */
// export const muted = new Enmap<Discord.Snowflake, Discord.Snowflake[]>({
//  name: "muted"
// })
