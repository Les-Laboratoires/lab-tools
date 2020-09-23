const path = require("path")
const dotenv = require("dotenv")
const Discord = require("discord.js")
const fs = require("fs").promises

dotenv.config({ path: path.join(__dirname, ".env") })

const client = new Discord.Client()

client.commands = new Discord.Collection()
client.prefix = /^(?:!|<@[!&]?555419470894596096>\s?)/
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
  if (!message.system) {
    if (client.prefix.test(message.content))
      message.content = message.content.replace(client.prefix, "")
    else return
    for (const command of client.commands.array()) {
      if(typeof command === "function"){
        try {
          if((await command(message)) !== false) return
        } catch (error) {
          console.error(error)
          if (message.channel instanceof Discord.GuildChannel) {
            message.channel.send(`Error: ${error.message}`).catch(client.throw)
          }
          return
        }
      }
    }
  }
})
