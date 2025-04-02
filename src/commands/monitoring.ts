import cp from "node:child_process"
import { Command } from "#core/command"
import { getSystemMessage, rootPath } from "#core/util"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-command command guide} for more information.
 */
export default new Command({
	name: "monitoring",
	aliases: ["monitor", "monit"],
	description: "Get the last 12 lines of logs",
	channelType: "guild",
	botOwnerOnly: true,
	async run(message) {
		// pm2 log tool --lines 12 --nostream --raw

		const output = cp.execSync("npx pm2 log tool --lines 12 --nostream --raw", {
			cwd: rootPath(),
			encoding: "utf-8",
		})

		await message.channel.send(
			await getSystemMessage(
				"success",
				{
					header: "The process is done",
					body: output,
				},
				{ code: "js" },
			),
		)
	},
	subs: [
		new Command({
			name: "trigger",
			description: "Trigger an unhandled error for testing",
			channelType: "guild",
			botOwnerOnly: true,
			async run() {
				setTimeout(() => {
					throw new Error("Test error")
				}, 1000)
			},
		}),
	],
})
