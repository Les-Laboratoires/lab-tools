import * as app from "../app"

import todoTable from "../tables/todo"

async function showTodoList(message: app.Message, target: string) {
  const todoList =
    (await todoTable.query.select().where("user_id", target)) || []
  new app.Paginator(
    app.Paginator.divider(
      todoList.map((todo) => {
        return `\`[${app
          .resizeText(todo.id, 3, true)
          .replace(/\s/g, "·")}]\` ${todo.content
          .replace(/[`*_~]/g, "")
          .replace(/[\s\n]+/g, " ")
          .slice(0, 40)}`
      }),
      10
    ).map((page) =>
      new app.MessageEmbed()
        .setTitle(
          `List of ${todoList.length} todo tasks of ${
            message.client.users.cache.get(target)?.username
          }`
        )
        .setDescription(page.join("\n"))
    ),
    message.channel,
    (reaction, user) => user.id === message.author.id
  )
}

const command: app.Command = {
  name: "todo",
  aliases: ["td"],
  description: "Add task or list todo tasks",
  async run(message) {
    if (message.rest.length === 0)
      return showTodoList(message, message.author.id)

    if (message.rest.startsWith("-"))
      message.rest = message.rest.slice(1).trim()

    const id = await todoTable.query
      .insert({
        user_id: message.author.id,
        content: message.rest,
      })
      .returning("id")
      .first()

    if (id) {
      return message.channel.send(
        `${message.client.emojis.resolve(
          app.Emotes.CHECK
        )} Saved with \`${id}\` as identifier.`
      )
    } else {
      return message.channel.send(
        `${message.client.emojis.resolve(
          app.Emotes.DENY
        )} An error has occurred.`
      )
    }
  },
  subs: [
    {
      name: "list",
      aliases: ["ls"],
      description: "Show todo list",
      positional: [
        {
          name: "target",
          description: "The target member",
          default: (message) => message.author.id,
        },
      ],
      async run(message) {
        return showTodoList(message, message.args.target)
      },
    },
    {
      name: "clear",
      aliases: ["clean"],
      description: "Clean todo list",
      async run(message) {
        await todoTable.query.delete().where("user_id", message.author.id)

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully deleted todo list`
        )
      },
    },
    {
      name: "get",
      aliases: ["show"],
      description: "Get a todo task",
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
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} Unknown todo task id.`
          )

        return message.channel.send(
          new app.MessageEmbed()
            .setTitle(
              `Todo task of ${
                message.client.users.cache.get(todo.user_id)?.username
              }`
            )
            .setDescription(todo.content)
            .setFooter(`Id: ${todo.id}`)
        )
      },
    },
    {
      name: "remove",
      aliases: ["delete", "del", "rm"],
      description: "Remove a todo task",
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
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} Unknown todo task id.`
          )

        if (todo.user_id !== message.author.id)
          return message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} This is not your own task.`
          )

        await todoTable.query.delete().where("id", message.args.id)

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully deleted todo task`
        )
      },
    },
    {
      name: "filter",
      aliases: ["find", "search", "q", "query", "all"],
      description: "Find some todo task",
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
          .map(
            (todo) =>
              `\`[${app
                .resizeText(todo.id, 3, true)
                .replace(/\s/g, "·")}]\` ${todo.content
                .replace(/[`*_~]/g, "")
                .replace(/[\s\n]+/g, " ")
                .slice(0, 40)}`
          )

        new app.Paginator(
          app.Paginator.divider(todoList, 10).map((page) =>
            new app.MessageEmbed()
              .setTitle(`Results of "${message.args.search}" search`)
              .setDescription(page.join("\n"))
          ),
          message.channel,
          (reaction, user) => user.id === message.author.id
        )
      },
    },
  ],
}

module.exports = command
