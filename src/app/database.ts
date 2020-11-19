import Enmap from "enmap"

export const globals = new Enmap<string, unknown>({
  name: "globals",
})

// /** Enmap[Guild, Prefix] */
// export const prefixes = new Enmap<Discord.Snowflake, string>({
//   name: "prefixes",
// })
//
// /** Enmap[Guild, Member[]] */
// export const muted = new Enmap<Discord.Snowflake, Discord.Snowflake[]>({
//  name: "muted"
// })
