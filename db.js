const Enmap = require("enmap")

const db = new Enmap({ name: "db" })

db.ensure("muted", [])

/**
 * @type {module:enmap.Enmap<string | number, any>}
 */
module.exports = db
