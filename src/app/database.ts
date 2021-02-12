import Enmap from "enmap"

export const cache = new Enmap<string, any>()

export const globals = new Enmap<string, any>({
  name: "globals",
})

export const customCommands = new Enmap<string, string>({
  name: "cc",
})

export const snippets = new Enmap<string, string>({
  name: "snippets",
})

export const coolDowns = new Enmap<string, CoolDown>()

export interface CoolDown {
  time: number
  trigger: boolean
}
