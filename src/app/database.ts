import Enmap from "enmap"
import * as app from "../app"

export const cache = new Enmap<string, any>()

export const globals = new Enmap<string, any>({
  name: "globals",
})

export const customCommands = new Enmap<string, string>({
  name: "cc",
})

export const money = new Enmap<string, number>({ name: "money" })
export async function transaction(
  taxed: string,
  paid: string[],
  amount: number,
  callback?: (missing: number) => unknown
): Promise<boolean> {
  let taxedMoney;
  if(!taxed.startsWith("company:")) {
    taxedMoney = money.ensure(taxed, 0)
  } else {
    const company = companies.ensure(taxed.replace("company:", ""), {
      name: "",
      ownerID: "",
      description: "",
      money: 0
    })
    taxedMoney = company.money
  }
  const total = paid.length * amount

  if (taxedMoney < total) {
    await callback?.(total - taxedMoney)
    return false
  }
  if(!taxed.startsWith("company:")) money.set(taxed, taxedMoney - total)
  else companies.set(taxed.replace("company:", ""), taxedMoney - total, "money")

  paid.forEach((id) => {
    if(id.startsWith("company:")) {
      const companyName = id.replace("company:", "")
      const company = companies.has(companyName)
      if(company) {
        companies.math(companyName, "+", amount, "money")
      }
    }
    app.money.set(id, app.money.ensure(id, 0) + amount)
  })

  await callback?.(0)
  return true
}

export const scores = new Enmap<string, Score>({
  name: "scores",
})

export const daily = new Enmap<string, Daily>({ name: "daily" })

export const counters = new Enmap<string, Counter>({
  name: "counters",
})

export const snippets = new Enmap<string, string>({
  name: "snippets",
})

export const companies = new Enmap<string,Company>({ 
  name: "companies"
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

export interface Company {
  name: string,
  ownerID: app.Discord.Snowflake,
  description: string,
  money: number
}

export interface Daily {
  last: number
  combo: number
}
