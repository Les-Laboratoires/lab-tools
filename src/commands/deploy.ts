import child from "child_process"
import tims from "tims"
import { promisify } from "util"
import * as app from "../app"

const exec = promisify(child.exec)

const command: app.Command = {
  name: "deploy",
  botOwner: true,
  description: "Deploy some Labs apps",
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
        `Déploiement réussi ! <:yay:557124850326437888>\n*Effectué en ${tims.duration(
          Date.now() - timer,
          { format: "ms", locale: "fr" }
        )}*`
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
      name: "atom",
      description: "Deploy Ayfri's atom-clicker game",
      async run(message) {
        const subject = await message.channel.send(
          "<a:wait:560972897376665600> Déploiement d'atom-clicker en cours..."
        )
        const timer = Date.now()

        try {
          await exec("/var/www/atom-clicker.tk/deploy.sh")
          await subject.edit(
            `Déploiement réussi ! <:yay:557124850326437888>\n*Effectué en ${tims.duration(
              Date.now() - timer,
              { format: "ms", locale: "fr" }
            )}*`
          )
        } catch (error) {
          await subject.edit(
            `Une erreur est survenue lors du déploiement <:why:557124850422906880>\nGo le faire à la main... ${app.toCodeBlock(
              `${error.name}: ${error.message}`,
              ""
            )}`
          )
        }
      },
    },
  ],
}

module.exports = command
