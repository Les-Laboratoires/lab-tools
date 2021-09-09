import * as command from "../app/command"

export const gameList = new Set<Game<any>>()

export class Game<Variables extends object> {
  constructor(
    public options: {
      name: string
      defaultVariables: Variables
      handleMessage(
        this: Game<Variables>,
        message: command.GuildMessage
      ): Promise<unknown> | unknown
    }
  ) {
    gameList.add(this)
  }

  get _(): Variables {
    return this.options.defaultVariables
  }
}

export const mastermind = new Game({
  name: "Mastermind",
  defaultVariables: { a: 3 },
  async handleMessage(message) {},
})
