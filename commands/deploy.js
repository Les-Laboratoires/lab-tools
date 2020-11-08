const exec = require("util").promisify(require("child_process").exec)
const utils = require("../utils")

const authorized = "352176756922253321"

module.exports = async function deploy(message) {
  if (message.author.id !== authorized) return

  const subject = await message.channel.send(
    "<a:wait:560972897376665600> En cours de déploiement..."
  )
  const timer = Date.now()

  try {
    await exec("git pull && npm i")
    await subject.edit(
      `<:yay:557124850326437888> Déploiement réussi !\n*Effectué en ${
        Date.now() - timer
      }ms*`
    )
    message.client.db.set("helloChannel", message.channel.id)
    process.exit(0)
  } catch (error) {
    await subject.edit(
      `<:why:557124850422906880> Une erreur est survenue lors du déploiement.\nGo le faire à la main... ${utils.code(
        `${error.name}: ${error.message}`,
        "js"
      )}`
    )
  }
}
