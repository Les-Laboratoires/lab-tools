import * as app from "../app"

const listener: app.Listener<"ready"> = {
  event: "ready",
  once: true,
  async call() {
    const helloChannel = await this.channels.fetch(
      app.globals.ensure("helloChannel", app.general)
    )

    if (helloChannel instanceof app.TextChannel) {
      await helloChannel.send("I'm back ! <a:dancing:576104669516922881>")
    }

    app.globals.delete("helloChannel")

    console.log("New deployment", app.dayjs().format("DD/MM/YYYY hh:mm:ss"))
  },
}

module.exports = listener
