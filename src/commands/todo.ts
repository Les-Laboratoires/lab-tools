import * as app from "../app.js"

import todoTable, { ToDo } from "../tables/todo.js"

function todoId(todo: ToDo) {
  return `\`[ ${app.forceTextSize(todo.id, 3, true)} ]\``
}

function todoItem(todo: ToDo) {
  return `${todoId(todo)} ${todo.content
    .replace(/[`*_~]/g, "")
    .replace(/[\s\n]+/g, " ")
    .slice(0, 40)}`
}

async function showTodoList(message: app.NormalMessage, user: app.User) {
  const perPage: number = message.args.perPage ?? 10

  new app.DynamicPaginator({
    channel: message.channel,
    filter: (reaction, user) => user.id === message.author.id,
    placeHolder: new app.MessageEmbed().setTitle("No todo task found."),
    async fetchPage(index): Promise<app.Page> {
      const itemCount = await app.countOf(
        todoTable.query.where("user_id", user.id)
      )
      const pageCount = Math.ceil(itemCount / perPage)
      const pageTasks = await todoTable.query
        .where("user_id", user.id)
        .offset(index * perPage)
        .limit(perPage)

      if (perPage === 1) {
        const [todo] = pageTasks

        return new app.SafeMessageEmbed()
          .setTitle(`Todo task of ${message.author.tag}`)
          .setDescription(`${todoId(todo)} ${todo.content}`)
          .setFooter({ text: `Item ${index + 1} / ${itemCount}` })
      }

      return new app.MessageEmbed()
        .setTitle(`Todo list of ${user.tag} (${itemCount} items)`)
        .setDescription(pageTasks.map(todoItem).join("\n"))
        .setFooter({ text: `Page ${index + 1} / ${pageCount}` })
    },
    async fetchPageCount(): Promise<number> {
      return Math.ceil(
        (await app.countOf(todoTable.query.where("user_id", user.id))) / perPage
      )
    },
  })
}

const perPageOption: app.Option<app.NormalMessage> = {
  name: "perPage",
  description: "Count of task per page",
  castValue: "number",
  default: () => "10",
  aliases: ["per", "by", "count", "nbr", "div"],
}

export default new app.Command({
  name: "todo",
  aliases: ["td"],
  channelType: "all",
  description: "Manage todo tasks",
  options: [perPageOption],
  async run(message) {
    return message.rest.length === 0
      ? showTodoList(message, message.author)
      : message.channel.send(
          `${app.emote(
            message,
            "DENY"
          )} Bad command usage. Show command detail with \`${
            message.usedPrefix
          }todo -h\``
        )
  },
  subs: [
    new app.Command({
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

        const count = await app.countOf(
          todoTable.query.where("user_id", message.author.id)
        )

        if (count > 999)
          return message.channel.send(
            `${app.emote(
              message,
              "DENY"
            )} You have too many todo tasks, please remove some first.`
          )

        try {
          const todoData: Omit<ToDo, "id"> = {
            user_id: message.author.id,
            content,
          }

          await todoTable.query.insert(todoData)

          const todo = await todoTable.query.where(todoData).first()

          if (!todo) throw new Error()

          return message.channel.send(
            `${app.emote(message, "CHECK")} Saved with ${todoId(
              todo
            )} as identifier.`
          )
        } catch (error: any) {
          app.error(error, __filename)
          return message.channel.send(
            `${app.emote(message, "DENY")} An error has occurred.`
          )
        }
      },
    }),
    new app.Command({
      name: "list",
      description: "Show todo list",
      aliases: ["ls"],
      channelType: "all",
      positional: [
        {
          name: "target",
          castValue: "user",
          description: "The target member",
          default: (message) => message?.author.id ?? "no default",
        },
      ],
      options: [perPageOption],
      async run(message) {
        return showTodoList(message, message.args.target)
      },
    }),
    new app.Command({
      name: "clear",
      description: "Clean todo list",
      aliases: ["clean"],
      channelType: "all",
      async run(message) {
        await todoTable.query.delete().where("user_id", message.author.id)

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully deleted todo list`
        )
      },
    }),
    new app.Command({
      name: "get",
      aliases: ["show"],
      description: "Get a todo task",
      channelType: "all",
      positional: [
        {
          name: "id",
          castValue: "number",
          required: true,
          description: "Id of todo task",
        },
      ],
      async run(message) {
        const todo = await todoTable.query
          .select()
          .where("id", message.args.id)
          .and.where("user_id", message.author.id)
          .first()

        if (!todo)
          return message.channel.send(
            `${app.emote(message, "DENY")} Unknown todo task id.`
          )

        return message.channel.send({
          embeds: [
            new app.MessageEmbed()
              .setTitle(`Todo task of ${message.author.tag}`)
              .setDescription(`${todoId(todo)} ${todo.content}`),
          ],
        })
      },
    }),
    new app.Command({
      name: "remove",
      description: "Remove a todo task",
      aliases: ["delete", "del", "rm", "-=", "--", "-"],
      channelType: "all",
      positional: [
        {
          name: "id",
          castValue: "number",
          required: true,
          description: "Id of todo task",
        },
      ],
      async run(message) {
        const todo = await todoTable.query
          .select()
          .where("id", message.args.id)
          .first()

        if (!todo)
          return message.channel.send(
            `${app.emote(message, "DENY")} Unknown todo task id.`
          )

        if (todo.user_id !== message.author.id)
          return message.channel.send(
            `${app.emote(message, "DENY")} This is not your own task.`
          )

        await todoTable.query.delete().where("id", message.args.id)

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully deleted todo task`
        )
      },
    }),
    new app.Command({
      name: "filter",
      description: "Find some todo task",
      aliases: ["find", "search", "q", "query", "all"],
      channelType: "all",
      positional: [
        {
          name: "search",
          required: true,
          description: "Searching query",
        },
      ],
      async run(message) {
        const todoList = (await todoTable.query.select())
          .filter((todo) => {
            return todo.content
              .toLowerCase()
              .includes(message.args.search.toLowerCase())
          })
          .map(todoItem)

        new app.StaticPaginator({
          channel: message.channel,
          placeHolder: new app.MessageEmbed().setTitle("No todo task found."),
          filter: (reaction, user) => user.id === message.author.id,
          pages: app.divider(todoList, 10).map((page, i, pages) =>
            new app.MessageEmbed()
              .setTitle(
                `Result of "${message.args.search}" search (${todoList.length} items)`
              )
              .setDescription(page.join("\n"))
              .setFooter({ text: `Page ${i + 1} / ${pages.length}` })
          ),
        })
      },
    }),
  ],
})
