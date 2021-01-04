import * as app from "../app"
import { CronJob } from "cron"

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

    await labs.members.fetch()

    const job = new CronJob(
      "0 0 * * *",
      async () => {
        let totalTax = 0
        let taxed = 0
        for (const member of labs.members.cache.array()) {
          const money = app.money.ensure(member.id, 0)
          const tax = Math.floor(money * app.tax)

          if (money < tax || tax === 0) continue
          totalTax += tax
          taxed++
          await app.transaction(member.id, ["bank"], tax)
        }
        const toTake = Math.round(app.royalties * totalTax)
        const admins = labs.members.cache.filter(member=>member.roles.cache.has(app.admin)).map(member=>member.id)
        await app.transaction("bank", admins, Math.round(toTake/admins.length))
        const channel = labs.channels.cache.get(
          app.publiclogs
        ) as app.TextChannel
        channel.send(
          `Les taxes de ce soir s'élèvent à un total de... ||${totalTax}${app.currency}|| pour ${taxed} membres taxés !`
        )
      },
      null,
      true,
      "Europe/Paris"
    )
    job.start()
  },
}

module.exports = listener
