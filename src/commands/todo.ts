import * as app from "../app"

function listTodo(message: app.Message) {
  const todoList = app.todo.ensure(message.author.id, [])
  new app.Paginator(
    app.Paginator.divider(
      todoList.map((todo, i) => {
        return `\`[${app.resizeText(i, 3, true).replace(/\s/g, "·")}]\` ${todo
          .replace(/[`*_~]/g, "")
          .replace(/[\s\n]+/g, " ")
          .slice(0, 40)}`
      }),
      10
    ).map((page) =>
      new app.MessageEmbed()
        .setTitle("Voici ta todo list")
        .setDescription(page.join("\n"))
    ),
    message.channel,
    (reaction, user) => user.id === message.author.id
  )
}

const command: app.Command = {
  name: "todo",
  aliases: ["td"],
  description: "Add a todo task",
  async run(message) {
    if (message.rest.length === 0) return listTodo(message)

    if (message.rest.startsWith("-"))
      message.rest = message.rest.slice(1).trim()

    const todoList = app.todo.ensure(message.author.id, [])
    app.todo.set(message.author.id, [...todoList, message.rest])
    return message.channel.send(`Votre todo a bien été enregistré.`)
  },
  subs: [
    {
      name: "list",
      aliases: ["ls"],
      description: "Show todo list",
      run: listTodo,
    },
    {
      name: "clear",
      aliases: ["clean"],
      description: "Clean todo list",
      async run(message) {
        app.todo.set(message.author.id, [])
        return message.channel.send("Votre liste de todo a bien été effacée.")
      },
    },
    {
      name: "get",
      aliases: ["show"],
      description: "Get a todo task",
      positional: [
        {
          name: "index",
          castValue: "number",
          required: true,
        },
      ],
      async run(message) {
        const todoList = app.todo.ensure(message.author.id, [])
        const index: number = message.positional.index

        if (index > todoList.length - 1) {
          return message.channel.send(`L'index donné est trop élevé...`)
        } else if (index < 0) {
          return message.channel.send(`L'index donné n'est pas positif...`)
        }

        const todo = todoList[index]

        return message.channel.send(
          new app.MessageEmbed()
            .setTitle("Voici votre todo")
            .setDescription(todo)
        )
      },
    },
    {
      name: "remove",
      aliases: ["delete", "del", "rm"],
      description: "Remove a todo task",
      positional: [
        {
          name: "index",
          castValue: "number",
          required: true,
        },
      ],
      async run(message) {
        const todoList = app.todo.ensure(message.author.id, [])
        const index: number = message.positional.index

        if (index > todoList.length - 1) {
          return message.channel.send(`L'index donné est trop élevé...`)
        } else if (index < 0) {
          return message.channel.send(`L'index donné n'est pas positif...`)
        }

        const [deleted] = todoList.splice(index, 1)

        app.todo.set(message.author.id, todoList)

        return message.channel.send(
          new app.MessageEmbed()
            .setTitle("Le todo suivant a bien éé effacé")
            .setDescription(deleted)
        )
      },
    },
    {
      name: "find",
      description: "Find a todo task",
      aliases: ["search", "q", "query"],
      async run(message) {
        const todoList = app.todo.ensure(message.author.id, [])
        const query = message.rest.toLowerCase()

        const todo = todoList.find(
          (todo) =>
            todo.toLowerCase().includes(query) ||
            todo
              .replace(/[`*_~]/g, "")
              .replace(/[\s\n]+/g, " ")
              .toLowerCase()
              .includes(query)
        )

        return message.channel.send(
          new app.MessageEmbed()
            .setTitle("Résultat de votre recherche")
            .setDescription(todo || "No result.")
        )
      },
    },
  ],
}

module.exports = command
