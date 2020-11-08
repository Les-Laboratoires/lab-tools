const fs = require("fs").promises
const path = require("path")

module.exports.validation = "659513985552351261"
module.exports.scientifique = "620641458168397845"
module.exports.presentations = "622383963511717928"
module.exports.approved = "640661715108888595"
module.exports.staff = "620657235533758494"
module.exports.modo = "620302774638215168"
module.exports.general = "620664805400772621"
module.exports.cobaye = "620640927089688587"

module.exports.forFiles = async function (pathList, callback) {
  for (const _path of pathList) {
    const dir = await fs.readdir(_path)
    for (const filename of dir) {
      const filePath = path.join(_path, filename)
      if ((await fs.stat(filePath)).isDirectory()) {
        await forFiles([filePath], callback)
      } else {
        await callback(filePath)
      }
    }
  }
}

/**
 * make a code block around the given code
 * @param {string} code - given code
 * @param {string} lang - programming language of given code
 * @returns {string} code in markdown code block
 */
module.exports.code = function (code, lang) {
  return "```" + lang + "\n" + code.replace(/```/g, "\\```") + "\n```"
}

module.exports.resolveMember = async function (message, text = null) {
  if (message.mentions.members.size > 0) return message.mentions.members.first()

  text = text || message.content

  if (text.length < 3) return message.member

  if (/^\d+$/.test(text)) {
    return message.guild.members.fetch(text)
  }

  text = text.toLowerCase()

  const members = await message.guild.members.fetch({ query: text })

  if (members.size > 0) return members.first()

  return message.member
}

module.exports.isModo = function (member) {
  return (
    member.permissions.has("ADMINISTRATOR", true) ||
    member.roles.cache.has(module.exports.modo)
  )
}
