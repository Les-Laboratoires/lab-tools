import * as app from "../app"

const listener: app.Listener<"ready"> = {
  event: "ready",
  once: true,
  async call() {
    const helloChannel = (await this.channels.fetch(
      app.globals.ensure("helloChannel", app.general)
    )) as app.TextChannel

    await helloChannel.send("I'm back ! <a:dancing:576104669516922881>")

    app.globals.delete("helloChannel")

    console.log("New deployment", app.dayjs().format("DD/MM/YYYY hh:mm:ss"))

    const labs = await this.guilds.fetch(app.labs)

    app.daily.ensure("taxe", -1)

    setInterval(async () => {
      const date = app.dayjs().date()

      if (date !== app.daily.get("taxe")) {
        app.daily.set("taxe", date)

        for (const member of labs.members.cache.array()) {
          const money = app.money.ensure(member.id, 0)
          const tax = Math.floor(money * 0.1)

          if (money < tax || tax === 0) continue

          await app.transaction(member.id, ["bank"], tax)
        }
      }
    }, 1000 * 60)
  },
}

module.exports = listener
