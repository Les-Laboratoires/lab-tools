const Enmap = require("enmap")

const db = new Enmap({ name: "db" })

db.ensure("muted", [])

module.exports = db
