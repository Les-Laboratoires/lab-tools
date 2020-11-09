const exec = require("util").promisify(require("child_process").exec)
const utils = require("../utils")

module.exports = async function deploy(message) {
  if (message.author.id !== utils.ghom) return

  const subject = await message.channel.send(
    "<a:wait:560972897376665600> En cours de déploiement..."
  )
  const timer = Date.now()

  try {
    await exec("git pull && npm i")
    await subject.edit(
      `Déploiement réussi ! <:yay:557124850326437888>\n*Effectué en ${
        Date.now() - timer
      }ms*`
    )
    message.client.db.set("helloChannel", message.channel.id)
    process.exit(0)
  } catch (error) {
    await subject.edit(
      `Une erreur est survenue lors du déploiement <:why:557124850422906880>\nGo le faire à la main... ${utils.code(
        `${error.name}: ${error.message}`,
        ""
      )}`
    )
  }
}
