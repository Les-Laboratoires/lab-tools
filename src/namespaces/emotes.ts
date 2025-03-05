import type { Client } from "discord.js"

export enum Emotes {
  Loading = "865282736041361468",
  CheckMark = "865281743333228604",
  Cross = "865281743560638464",
  Minus = "865281743422226443",
  Plus = "865281743648194610",
  Left = "865281743371894794",
  Right = "865281743510044723",
}

export function emote(
  { client }: { client: Client },
  name: keyof typeof Emotes,
) {
  return client.emojis.resolve(Emotes[name])
}
