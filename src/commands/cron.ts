import * as app from "../app"
import cron from "cron"

const command: app.Command = {
  name: "cron",
  description: "Manage cron jobs",
  async run(message) {
    return app.sendCommandDetails(message, this, process.env.PREFIX ?? "!")
  },
  subs: [
    {
      name: "start",
      aliases: ["launch", "run", "play"],
      staffOnly: true,
      positional: [
        {
          name: "name",
        },
      ],
      async run(message) {
        if (message.positional.name) {
          const currentCron = app.cron.get(message.positional.name)

          if (!currentCron)
            return message.channel.send("Ce cron n'existe pas...")

          if (
            currentCron.authorId !== message.author.id &&
            message.author.id !== process.env.OWNER
          )
            return message.channel.send("Ce cron ne t'appartient pas!")

          let job = app.cache.get<cron.CronJob>(
            "job-" + message.positional.name
          )

          if (!job) {
            const channel = await message.client.channels.fetch(
              currentCron.channelId
            )
            job = cron.job(currentCron.period, () => {
              if (channel.isText()) channel.send(currentCron.message)
            })
            app.cache.set("job-" + message.positional.name, job)
          }

          if (job.running)
            return message.channel.send("Le cron est déjà lancé.")

          job.start()

          return message.channel.send(
            `Votre cron "${message.positional.name}" s'est correctement lancé.`
          )
        }
      },
    },
    {
      name: "stop",
      aliases: ["exit", "kill"],
      staffOnly: true,
      positional: [
        {
          name: "name",
        },
      ],
      async run(message) {
        if (message.positional.name) {
          const currentCron = app.cron.get(message.positional.name)

          if (!currentCron)
            return message.channel.send("Ce cron n'existe pas...")

          if (
            currentCron.authorId !== message.author.id &&
            message.author.id !== process.env.OWNER
          )
            return message.channel.send("Ce cron ne t'appartient pas!")

          const job = app.cache.get<cron.CronJob>(
            "job-" + message.positional.name
          )

          if (!job) return message.channel.send("Ce cron n'est pas lancé...")

          job.stop()

          return message.channel.send("Ton cron a correctement été stoppé.")
        }
      },
    },
    {
      name: "delete",
      aliases: ["remove", "rm", "del"],
      staffOnly: true,
      positional: [
        {
          name: "name",
        },
      ],
      async run(message) {
        if (message.positional.name) {
          const currentCron = app.cron.get(message.positional.name)

          if (!currentCron)
            return message.channel.send("Ce cron n'existe pas...")

          if (
            currentCron.authorId !== message.author.id &&
            message.author.id !== process.env.OWNER
          )
            return message.channel.send("Ce cron ne t'appartient pas!")

          const job = app.cache.get<cron.CronJob>(
            "job-" + message.positional.name
          )

          job?.stop()

          app.cache.delete("job-" + message.positional.name)
          app.cron.delete(message.positional.name)

          return message.channel.send("Ton cron a correctement été supprimé.")
        }
      },
    },
    {
      name: "add",
      aliases: ["set", "create", "make"],
      staffOnly: true,
      positional: [
        {
          name: "name",
          required: true,
        },
      ],
      args: [
        {
          name: "channelId",
          required: true,
        },
        {
          name: "period",
          required: true,
        },
        {
          name: "message",
          required: true,
        },
      ],
      async run(message) {
        let channel: app.Channel
        try {
          channel = await message.client.channels.fetch(message.args.channelId)
        } catch (error) {
          return message.channel.send("Ton `channelId` est inexistant.")
        }

        if (!channel.isText())
          return message.channel.send("Le channel ciblé n'est pas textuel...")

        try {
          const job = cron.job(message.args.period, () => {
            if (channel.isText()) channel.send(message.args.message)
          })

          job.start()

          app.cache.set("job-" + message.positional.name, job)
        } catch (error) {
          return message.channel.send("Ta `period` est peut être mauvaise...")
        }

        app.cron.set(message.positional.name, {
          channelId: message.args.channelId,
          authorId: message.author.id,
          message: message.args.message,
          period: message.args.period,
        })

        return message.channel.send(
          `Ton cron "${message.positional.name}" a bien été sauvegardé et lancé !`
        )
      },
    },
    {
      name: "list",
      aliases: ["ls"],
      async run(message) {
        new app.Paginator(
          app.Paginator.divider(Array.from(app.cron.entries()), 10).map(
            (page) => {
              return new app.MessageEmbed()
                .setTitle("Voici une liste des cron")
                .setDescription(
                  page
                    .map(([name, cron]) => {
                      const job = app.cache.get<cron.CronJob>("job-" + name)
                      return `\`${app.resizeText(
                        name,
                        6,
                        true
                      )}\` | period: \`${app.resizeText(cron.period, 15)}\` | ${
                        job?.running
                          ? "<a:wait:813551205283790889> Running..."
                          : "🛑 Stopped"
                      }`
                    })
                    .join("\n")
                )
            }
          ),
          message.channel,
          (reaction, user) => {
            return message.author.id === user.id
          }
        )
      },
    },
  ],
}

module.exports = command
