import * as discordEval from "discord-eval.ts"
import * as discord from "discord.js"

// import { $ } from "bun"
import { execSync } from "node:child_process"

import { Command } from "#core/command"
import logger from "#core/logger"
import { CooldownType, getSystemMessage, rootPath } from "#core/util"
import { emote } from "#namespaces/emotes"
import restart from "#tables/restart"

type State = "waiting" | "running" | "done" | "error"
type Task = { cmd: string; state: State; time: number; path?: string }

// $.cwd(rootPath())

export default new Command({
	name: "deploy",
	description: "Deploy Lab Tool",
	channelType: "all",
	botOwnerOnly: true,
	cooldown: {
		duration: 10000,
		type: CooldownType.Global,
	},
	flags: [
		{
			name: "validate",
			flag: "v",
			description: "Mark the last deploy as validated",
			aliases: ["push", "ok", "yes", "valid"],
		},
	],
	async run(message) {
		message.triggerCooldown()

		const validate = message.args.validate

		const tasks: Task[] = [
			{ state: "waiting", time: 0, cmd: "git reset --hard" },
			{ state: "waiting", time: 0, cmd: "git pull" },
			{ state: "waiting", time: 0, cmd: "bun install" },
			{ state: "waiting", time: 0, cmd: "npm exec pm2 -y -- restart tool" },
		]

		if (!validate) {
			tasks.unshift(
				{
					state: "waiting",
					time: 0,
					cmd: "rm -rf temp",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "git clone . temp",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "git pull origin master",
					path: "temp",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "bun install",
					path: "temp",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "cp .env temp/.env",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "sed -i 's/\\r$//' crash_test.sh",
					path: "temp/crash_test",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "chmod +x crash_test.sh",
					path: "temp/crash_test",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "./crash_test.sh",
					path: "temp/crash_test",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "cp temp/crash_test/crash_test.log crash_test/crash_test.log",
				},
				{
					state: "waiting",
					time: 0,
					cmd: "rm -rf temp",
				},
			)
		}

		const format = (task: Task) =>
			`${emote(
				message,
				(
					{
						waiting: "Minus",
						running: "Loading",
						done: "CheckMark",
						error: "Cross",
					} as const
				)[task.state],
			)} ${task.state === "running" ? "**" : ""}\`$${
				task.path ? `(${task.path})` : ""
			} ${task.cmd}\`${
				task.state === "running" ? "**" : ""
			} ${task.time ? `(**${task.time}** ms)` : ""}`.trim()

		const makeView = (finish?: boolean, errored?: boolean) =>
			`${tasks
				.map((task) => format({ ...task, state: finish ? "done" : task.state }))
				.join(
					"\n",
				)}\n${emote(message, finish ? "CheckMark" : errored ? "Cross" : "Loading")} ${
				finish ? "**Deployed** 🚀" : errored ? "Errored" : "Deploying..."
			}`

		const run = async (task: Task) => {
			task.state = "running"

			await view.edit(makeView())

			try {
				// await $`${task.cmd}`.quiet()
				execSync(task.cmd, {
					cwd: task.path ? rootPath(task.path) : rootPath(),
				})
			} catch (error: any) {
				task.state = "error"

				await view.edit(makeView(false, true))

				throw error
			}

			task.state = "done"
		}

		const view = await message.channel.send(makeView())

		const created_at = new Date().toISOString()

		await restart.query.insert({
			content: makeView(true),
			last_channel_id: message.channel.id,
			last_message_id: view.id,
			created_at,
		})

		try {
			for (const command of tasks) {
				const time = Date.now()

				await run(command)

				command.time = Date.now() - time
			}
		} catch (error: any) {
			await restart.query.delete().where({ created_at })

			logger.error(error)

			return view.edit(await getSystemMessage("error", error, { stack: true }))
		}
	},
})
