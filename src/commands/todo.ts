import * as app from "../app"
import { todo } from "../app"

const command: app.Command = {
  name: "todo",
  aliases: ["td"],
  async run(message) {
    const todoList = app.todo.ensure(message.author.id, [])
    return message.channel.send(
      new app.MessageEmbed().setTitle("Voici ta todo list").setDescription(
        todoList.map((todo, i) => {
          return `\`[${app.resizeText(i, 3, true).replace(/\s/g, "·")}]\` ${todo
            .replace(/[`*_~]/g, "")
            .replace(/[\s\n]+/g, " ")
            .slice(0, 64)}`
        })
      )
    )
  },
  subs: [
    {
      name: "add",
      aliases: ["set", "new"],
      async run(message) {
        const todoList = app.todo.ensure(message.author.id, [])
        app.todo.set(message.author.id, [...todoList, message.rest])
        return message.channel.send(`Votre todo a bien été enregistré.`)
      },
    },
    {
      name: "clear",
      aliases: ["clean"],
      async run(message) {
        app.todo.set(message.author.id, [])
        return message.channel.send("Votre liste de todo a bien été effacée.")
      },
    },
    {
      name: "remove",
      aliases: ["delete", "del", "rm"],
      positional: [
        {
          name: "index",
          castValue: "number",
          required: true,
        },
      ],
      async run(message) {
        const todoList = app.todo.ensure(message.author.id, [])

        if (message.positional.index > todoList.length - 1) {
          return message.channel.send(`L'index donné est trop élevé...`)
        } else if (message.positional.index < 0) {
          return message.channel.send(`L'index donné n'est pas positif...`)
        }

        const [deleted] = todoList.splice(message.positional.index, 1)

        app.todo.set(message.author.id, todoList)

        return message.channel.send(
          new app.MessageEmbed()
            .setTitle("Le todo suivant a bien éé effacé")
            .setDescription(deleted)
        )
      },
    },
  ],
}

module.exports = command
