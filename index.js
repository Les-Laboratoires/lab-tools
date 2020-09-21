const path = require("path")
const dotenv = require("dotenv")
const Discord = require("discord.js")
const fs = require("fs").promises

dotenv.config({ path: path.join(__dirname, ".env") })

const client = new Discord.Client()

client.commands = new Discord.Collection()
client.prefix = "!"
client.throw = (error) => {
  throw error
}

console.log("login...")

client
  .login(process.env.TOKEN)
  .catch(client.throw)
  .then(() => {
    console.log("logged-in.")
    fs.readdir(path.join(__dirname, "commands"))
      .catch(client.throw)
      .then((commandNames) => {
        console.log("loading commands...")
        for (const commandName of commandNames) {
          if (commandName.endsWith(".js")) {
            client.commands.set(
              commandName,
              require(path.join(__dirname, "commands", commandName))
            )
            console.log("loaded", commandName)
          }
        }
      })
  })

client.on("message", async (message) => {
  if(!message.system) {
    if(message.content.startsWith(client.prefix))
      message.content = message.content.slice(client.prefix.length)
    else return
    for (const [, command] of client.commands) {
      if (
        typeof command === "function" &&
        await command(message) !== false
      ) return
    }
  }
})
