const utils = require("../utils")

async function ready() {
  const helloChannel = await this.channels.fetch(
    this.db.ensure("helloChannel", utils.general)
  )

  await helloChannel.send("I'm back ! <a:dancing:576104669516922881>")

  this.db.delete("helloChannel")

  console.log("New deployment", this.date().format("DD/MM/YYYY hh:mm:ss"))
}

ready.once = true

module.exports = ready
