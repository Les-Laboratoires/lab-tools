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
			name: "error",
			aliases: ["err"],
			description: "Trigger an error for testing",
			channelType: "guild",
			botOwnerOnly: true,
			flags: [
				{
					name: "unhandled",
					flag: "u",
					description: "Trigger an unhandled error",
				},
			],
			async run(message) {
				if (message.args.unhandled) {
					setTimeout(() => {
						throw new Error("Hi there! This is a test error.")
					}, 100)
				} else {
					throw new Error("Hi there! This is a test error.")
				}
			},
		}),
	],
})
