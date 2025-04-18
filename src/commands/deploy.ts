import * as discordEval from "discord-eval.ts"
import * as discord from "discord.js"

// import { $ } from "bun"
import { execSync } from "node:child_process"

import { Command } from "#core/command"
import logger from "#core/logger"
import { CooldownType, rootPath } from "#core/util"
import { emote } from "#namespaces/emotes"

import restart from "#tables/restart"

type State = "waiting" | "running" | "done" | "error"
type Task = { cmd: string; state: State; time: number }

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
	async run(message) {
		message.triggerCooldown()

		const tasks: Task[] = [
			{ state: "waiting", time: 0, cmd: "git reset --hard" },
			{ state: "waiting", time: 0, cmd: "git pull" },
			{ state: "waiting", time: 0, cmd: "bun install" },
			{ state: "waiting", time: 0, cmd: "npm exec pm2 -y -- restart tool" },
		]

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
			)} ${task.state === "running" ? "**" : ""}\`>_ ${task.cmd}\`${
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
				execSync(task.cmd, { cwd: rootPath() })
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

			return view.edit({
				embeds: [
					new discord.EmbedBuilder()
						.setTitle("\\❌ An error has occurred.")
						.setColor("Red")
						.setDescription(
							await discordEval.code.stringify({
								content: (error?.stack ?? error?.message ?? String(error))
									.split("")
									.reverse()
									.slice(0, 2000)
									.reverse()
									.join(""),
							}),
						),
				],
			})
		}
	},
})
