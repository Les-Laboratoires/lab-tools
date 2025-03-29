import { Command, type UnknownMessage, option, positional } from "#core/index"
import { DynamicPaginator, type Page, StaticPaginator } from "#core/pagination"
import { divider, forceTextSize, getSystemMessage } from "#core/util"

import { emote } from "#namespaces/emotes"
import { countOf, getUser } from "#namespaces/tools"

import todoTable, { type ToDo } from "#tables/todo"
import type { User } from "#tables/user"

import { filename } from "dirname-filename-esm"
import { EmbedBuilder, type SendableChannels } from "discord.js"

const __filename = filename(import.meta)

function todoId(todo: ToDo) {
	return `\`[ ${forceTextSize(todo._id, 3, true)} ]\``
}

function todoItem(todo: ToDo) {
	return `${todoId(todo)} ${todo.content
		.replace(/[`*_~]/g, "")
		.replace(/[\s\n]+/g, " ")
		.slice(0, 40)}`
}

async function showTodoList(message: UnknownMessage, user: User, perPage = 10) {
	new DynamicPaginator({
		target: message.channel,
		filter: (reaction, user) => user.id === message.author.id,
		placeHolder: await getSystemMessage("default", "No todo task found."),
		async fetchPage(index): Promise<Page> {
			const itemCount = await countOf(
				todoTable.query.where("user_id", user._id),
			)
			const pageCount = Math.ceil(itemCount / perPage)
			const pageTasks = await todoTable.query
				.where("user_id", user._id)
				.offset(index * perPage)
				.limit(perPage)

			if (pageTasks.length === 0)
				return getSystemMessage("default", "No todo task found.")

			if (perPage === 1) {
				const [todo] = pageTasks

				return await getSystemMessage("default", {
					header: `Todo task of ${message.author.tag}`,
					body: `${todoId(todo)} ${todo.content}`,
					footer: `Item ${index + 1} / ${itemCount}`,
					date: todo.created_at,
				})
			}

			return await getSystemMessage("default", {
				header: `Todo list of ${message.author.tag} (${itemCount} items)`,
				body: pageTasks.map(todoItem).join("\n"),
				footer: `Page ${index + 1} / ${pageCount}`,
			})
		},
		async fetchPageCount(): Promise<number> {
			return Math.ceil(
				(await countOf(todoTable.query.where("user_id", user._id))) / perPage,
			)
		},
	})
}

const perPageOption = option({
	name: "perPage",
	description: "Count of task per page",
	type: "number",
	default: () => 10,
	aliases: ["per", "by", "count", "nbr", "div", "*"],
})

export default new Command({
	name: "todo",
	aliases: ["td"],
	channelType: "all",
	description: "Manage todo tasks",
	options: [perPageOption],
	async run(message) {
		const user = await getUser(message.author, true)

		return message.rest.length === 0
			? showTodoList(message, user, message.args.perPage)
			: message.channel.send(
					`${emote(
						message,
						"Cross",
					)} Bad command usage. Show command detail with \`${
						message.usedPrefix
					}todo -h\``,
				)
	},
	subs: [
		new Command({
			name: "add",
			description: "Add new todo task",
			aliases: ["new", "+=", "++", "+"],
			channelType: "all",
			rest: {
				name: "content",
				description: "Task content",
				required: true,
				all: true,
			},
			async run(message) {
				const content: string = message.args.content.startsWith("-")
					? message.args.content.slice(1).trim()
					: message.args.content

				const user = await getUser(message.author, true)

				const count = await countOf(todoTable.query.where("user_id", user._id))

				if (count > 999)
					return message.channel.send(
						`${emote(
							message,
							"Cross",
						)} You have too many todo tasks, please remove some first.`,
					)

				try {
					const todoData: Omit<ToDo, "_id" | "created_at"> = {
						user_id: user._id,
						content,
					}

					await todoTable.query.insert(todoData)

					const todo = await todoTable.query.where(todoData).first()

					if (!todo) throw new Error("Internal error in src/commands/todo.ts")

					return message.channel.send(
						`${emote(message, "CheckMark")} Saved with ${todoId(
							todo,
						)} as identifier.`,
					)
				} catch (error: any) {
					error(error, __filename)
					return message.channel.send(
						`${emote(message, "Cross")} An error has occurred.`,
					)
				}
			},
		}),
		new Command({
			name: "list",
			description: "Show todo list",
			aliases: ["ls"],
			channelType: "all",
			positional: [
				positional({
					name: "target",
					type: "user",
					description: "The target member",
					default: (message) => message.author,
				}),
			],
			options: [perPageOption],
			async run(message) {
				const target = await getUser(message.args.target, true)

				return showTodoList(message, target, message.args.perPage)
			},
		}),
		new Command({
			name: "clear",
			description: "Clean todo list",
			aliases: ["clean"],
			channelType: "all",
			async run(message) {
				const user = await getUser(message.author, true)

				await todoTable.query.delete().where("user_id", user._id)

				return message.channel.send(
					`${emote(message, "CheckMark")} Successfully deleted todo list`,
				)
			},
		}),
		new Command({
			name: "get",
			aliases: ["show"],
			description: "Get a todo task",
			channelType: "all",
			positional: [
				{
					name: "id",
					type: "number",
					required: true,
					description: "Id of todo task",
				},
			],
			async run(message) {
				const user = await getUser(message.author, true)

				const todo = await todoTable.query
					.select()
					.where("_id", message.args.id)
					.and.where("user_id", user._id)
					.first()

				if (!todo)
					return message.channel.send(
						`${emote(message, "Cross")} Unknown todo task id.`,
					)

				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`Todo task of ${message.author.tag}`)
							.setDescription(`${todoId(todo)} ${todo.content}`)
							.setTimestamp(todo.created_at),
					],
				})
			},
		}),
		new Command({
			name: "remove",
			description: "Remove a todo task",
			aliases: ["delete", "del", "rm", "-=", "--", "-"],
			channelType: "all",
			positional: [
				{
					name: "id",
					type: "number",
					required: true,
					description: "Id of todo task",
				},
			],
			async run(message) {
				const todo = await todoTable.query
					.select()
					.where("_id", message.args.id)
					.first()

				if (!todo)
					return message.channel.send(
						`${emote(message, "Cross")} Unknown todo task id.`,
					)

				const user = await getUser(message.author, true)

				if (todo.user_id !== user._id)
					return message.channel.send(
						`${emote(message, "Cross")} This is not your own task.`,
					)

				await todoTable.query.delete().where("_id", message.args.id)

				return message.channel.send(
					`${emote(message, "CheckMark")} Successfully deleted todo task`,
				)
			},
		}),
		new Command({
			name: "filter",
			description: "Find some todo task",
			aliases: ["find", "search", "q", "query", "all"],
			channelType: "all",
			positional: [
				{
					name: "search",
					description: "Searching query",
					type: "string",
					required: true,
				},
			],
			async run(message) {
				const user = await getUser(message.author, true)

				const todoList = (await todoTable.query.where("user_id", user._id))
					.filter((todo) => {
						return todo.content
							.toLowerCase()
							.includes(message.args.search.toLowerCase())
					})
					.map(todoItem)

				new StaticPaginator({
					target: message.channel as SendableChannels,
					placeHolder: await getSystemMessage("default", "No todo task found."),
					filter: (reaction, user) => user.id === message.author.id,
					pages: divider(todoList, 10).map((page, i, pages) =>
						getSystemMessage("default", {
							header: `Result of "${message.args.search}" search (${todoList.length} items)`,
							body: page.join("\n"),
							footer: `Page ${i + 1} / ${pages.length}`,
						}),
					),
				})
			},
		}),
	],
})
