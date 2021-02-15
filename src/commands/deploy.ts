import child from "child_process"
import { promisify } from "util"
import * as app from "../app"

const exec = promisify(child.exec)

const command: app.Command = {
  name: "deploy",
  botOwner: true,
  args: [
    {
      name: "branch",
      default: "master",
      aliases: ["b"],
    },
  ],
  async run(message) {
    const subject = await message.channel.send(
      "<a:wait:560972897376665600> En cours de déploiement..."
    )
    const timer = Date.now()

    try {
      const branch = message.args.branch
      await exec("git fetch")
      await exec("git reset --hard")
      await exec("git checkout " + branch)
      await exec("git reset --hard")
      await exec("git pull origin " + branch)
      await exec("npm i")
      await exec("npm run build")
      await subject.edit(
        `Déploiement réussi ! <:yay:557124850326437888>\n*Effectué en ${
          Date.now() - timer
        }ms*`
      )
      app.globals.set("helloChannel", message.channel.id)
      process.exit(0)
    } catch (error) {
      await subject.edit(
        `Une erreur est survenue lors du déploiement <:why:557124850422906880>\nGo le faire à la main... ${app.toCodeBlock(
          `${error.name}: ${error.message}`,
          ""
        )}`
      )
    }
  },
  subs: [
    {
      name: "atom-clicker",
      aliases: ["atom"],
      async run(message) {
        return message.channel.send("Coucou")
      },
    },
  ],
}

module.exports = command
