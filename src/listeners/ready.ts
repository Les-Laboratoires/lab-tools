import * as app from "../app"
import cron from "cron"

const listener: app.Listener<"ready"> = {
  event: "ready",
  once: true,
  async call() {
    const helloChannel = (await this.channels.fetch(
      app.globals.ensure("helloChannel", app.general)
    )) as app.TextChannel

    console.log("ready")

    await helloChannel.send("I'm back ! <a:dancing:576104669516922881>")

    app.globals.delete("helloChannel")

    app.cron.forEach((currentCron, name) => {
      this.channels.fetch(currentCron.channelId).then((channel) => {
        const job = cron.job(currentCron.period, () => {
          if (channel.isText()) channel.send(currentCron.message)
        })

        job.start()

        app.cache.set("job-" + name, job)
      })
    })

    console.log("New deployment", app.dayjs().format("DD/MM/YYYY hh:mm:ss"))
  },
}

module.exports = listener
