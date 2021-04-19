import Enmap from "enmap"

export const globals = new Enmap<string, any>({
  name: "globals",
})

export const customCommands = new Enmap<string, string>({
  name: "cc",
})

export const snippets = new Enmap<string, string>({
  name: "snippets",
})

export const todo = new Enmap<string, string[]>({
  name: "todo",
})

export const cron = new Enmap<string, Cron>({
  name: "cron",
})

export const coolDowns = new Enmap<string, CoolDown>()

export const score = new Enmap<string, number>()

export interface CoolDown {
  time: number
  trigger: boolean
}

export interface Cron {
  channelId: string
  authorId: string
  message: string
  period: string
}
