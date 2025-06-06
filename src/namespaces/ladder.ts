import discord from "discord.js"
import * as argument from "#core/argument"
import * as command from "#core/command"
import * as pagination from "#core/pagination"

import * as emotes from "#namespaces/emotes"

export function formatRank(rank: number) {
	return `\`[ ${String(rank).padStart(3)} ]\``
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
		return new discord.EmbedBuilder()
			.setTitle(`${this.options.title} leaderboard`)
			.setDescription(
				(await this.fetchPage(options)) ||
					`${emotes.emote(ctx, "Cross")} No ladder available`,
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
		channel: discord.SendableChannels,
		options: Omit<LadderPaginatorOptions, "pageIndex">,
	) {
		new pagination.DynamicPaginator({
			target: channel,
			fetchPageCount: () => {
				return this.fetchPageCount(options)
			},
			fetchPage: async (pageIndex) => {
				const page = await this.options.fetchLines({
					pageIndex,
					...options,
				})

				if (page.length === 0)
					return {
						content: `${emotes.emote(channel, "Cross")} No ladder available.`,
					}

				return {
					embeds: [
						await this.fetchEmbed(channel, {
							pageIndex,
							...options,
						}),
					],
				}
			},
		})
	}

	generateCommand() {
		return new command.Command({
			name: "leaderboard",
			description: `Show the leaderboard of ${this.options.title.toLowerCase()}`,
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
