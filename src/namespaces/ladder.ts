import discord from "discord.js"
import * as util from "../app/util.js"
import * as command from "../app/command.js"
import * as argument from "../app/argument.js"
import * as pagination from "../app/pagination.js"

import * as tools from "./tools.js"

export function formatRank(rank: number) {
  return `\`[ ${util.forceTextSize(rank, 3, true)} ]\``
}

export interface LadderLine {
  rank: number
}

export interface LadderPaginatorOptions {
  pageIndex: number
  pageLineCount: number
}

export interface LadderOptions<Line extends LadderLine> {
  title: string
  fetchLines(options: LadderPaginatorOptions): Promise<Line[]>
  fetchLineCount(): Promise<number>
  formatLine(line: Line, index: number, lines: Line[]): string
}

export class Ladder<Line extends LadderLine> {
  constructor(public readonly options: LadderOptions<Line>) {}

  async fetchPage(options: LadderPaginatorOptions) {
    const lines = await this.options.fetchLines(options)

    return lines.map(this.options.formatLine).join("\n")
  }

  async fetchEmbed(
    ctx: { client: discord.Client },
    options: LadderPaginatorOptions,
  ) {
    return new discord.MessageEmbed()
      .setTitle(`${this.options.title} leaderboard`)
      .setDescription(
        (await this.fetchPage(options)) ||
          `${tools.emote(ctx, "DENY")} No ladder available`,
      )
      .setFooter({
        text: `Page: ${options.pageIndex + 1} / ${await this.fetchPageCount(
          options,
        )}`,
      })
  }

  async fetchPageCount(options: Omit<LadderPaginatorOptions, "pageIndex">) {
    const total = await this.options.fetchLineCount()
    return Math.ceil(total / options.pageLineCount)
  }

  /**
   * Seng the ladder paginator to a channel
   */
  send(
    channel: discord.TextChannel,
    options: Omit<LadderPaginatorOptions, "pageIndex">,
  ) {
    new pagination.DynamicPaginator({
      channel,
      fetchPageCount: () => {
        return this.fetchPageCount(options)
      },
      fetchPage: async (pageIndex) => {
        const page = await this.options.fetchLines({
          pageIndex,
          ...options,
        })

        if (page.length === 0)
          return `${tools.emote(channel, "DENY")} No ladder available.`

        return await this.fetchEmbed(channel, {
          pageIndex,
          ...options,
        })
      },
    })
  }

  generateCommand() {
    return new command.Command({
      name: "leaderboard",
      description: `Show the leaderboard of ${this.options.title}`,
      channelType: "guild",
      aliases: ["ladder", "lb", "top", "rank"],
      options: [
        argument.option({
          name: "lines",
          description: "Number of lines to show per page",
          type: "number",
          default: 15,
          aliases: ["line", "count"],
          validate: (value) => value > 0 && value <= 50,
        }),
      ],
      run: async (message) => {
        this.send(message.channel, {
          pageLineCount: message.args.lines,
        })
      },
    })
  }
}
