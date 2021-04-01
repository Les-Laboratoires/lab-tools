import * as app from "../app"
import cron from "cron"

import cronTable from "../tables/cron"

const command: app.Command<app.GuildMessage> = {
  name: "cron",
  description: "Manage cron jobs",
  async run(message) {
    return app.sendCommandDetails(message, this, process.env.PREFIX ?? "!")
  },
  subs: [
    {
      name: "start",
      aliases: ["launch", "run", "play"],
      description: "Start a task",
      middlewares: [app.staffOnly],
      positional: [
        {
          name: "name",
          required: true,
          description: "The name of task",
        },
      ],
      async run(message) {
        if (message.args.name) {
          const slug = app.slug("job", message.args.name)

          const currentCron = await cronTable.query
            .select()
            .where("name", message.args.name)
            .first()

          if (!currentCron)
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} Unknown cron task.`
            )

          if (
            currentCron.user_id !== message.author.id &&
            message.author.id !== process.env.OWNER
          )
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} This is not your own cron task.`
            )

          let job = app.cache.get<cron.CronJob>(slug)

          if (!job) {
            const channel = await message.client.channels.fetch(
              currentCron.channel_id
            )
            job = cron.job(currentCron.period, () => {
              if (channel.isText()) channel.send(currentCron.content)
            })
            app.cache.set(slug, job)
          }

          if (job.running)
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} This cron is already running.`
            )

          job.start()

          return message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.CHECK
            )} Successfully started.`
          )
        }
      },
    },
    {
      name: "stop",
      aliases: ["exit", "kill"],
      description: "Stop a task",
      middlewares: [app.staffOnly],
      positional: [
        {
          name: "name",
          description: "The name of task",
        },
      ],
      async run(message) {
        if (message.args.name) {
          const slug = app.slug("job", message.args.name)

          const currentCron = await cronTable.query
            .select()
            .where("name", message.args.name)
            .first()

          if (!currentCron)
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} Unknown cron task.`
            )

          if (
            currentCron.user_id !== message.author.id &&
            message.author.id !== process.env.OWNER
          )
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} This is not your own cron task.`
            )

          const job = app.cache.get<cron.CronJob>(slug)

          if (!job)
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} This cron is already stopped.`
            )

          job.stop()

          return message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.CHECK
            )} Successfully stopped.`
          )
        }
      },
    },
    {
      name: "delete",
      aliases: ["remove", "rm", "del"],
      middlewares: [app.staffOnly],
      description: "Remove a task",
      positional: [
        {
          name: "name",
          description: "The name of task",
        },
      ],
      async run(message) {
        if (message.args.name) {
          const slug = app.slug("job", message.args.name)

          const currentCron = await cronTable.query
            .select()
            .where("name", message.args.name)
            .first()

          if (!currentCron)
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} Unknown cron task.`
            )

          if (
            currentCron.user_id !== message.author.id &&
            message.author.id !== process.env.OWNER
          )
            return message.channel.send(
              `${message.client.emojis.resolve(
                app.Emotes.DENY
              )} This is not your own cron task.`
            )

          const job = app.cache.get<cron.CronJob>(slug)

          job?.stop()

          app.cache.delete(slug)

          await cronTable.query.delete().where("name", message.args.name)

          return message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.CHECK
            )} Successfully removed.`
          )
        }
      },
    },
    {
      name: "add",
      aliases: ["set", "create", "make"],
      middlewares: [app.staffOnly],
      description: "Add a task",
      positional: [
        {
          name: "name",
          description: "The name of task",
          required: true,
        },
      ],
      args: [
        {
          name: "channel",
          description: "The channel id of task",
          required: true,
        },
        {
          name: "period",
          description: "The period of task",
          required: true,
        },
        {
          name: "content",
          description: "The content of task",
          required: true,
        },
      ],
      async run(message) {
        const slug = app.slug("job", message.args.name)

        let channel: app.Channel
        try {
          channel = await message.client.channels.fetch(message.args.channel)
        } catch (error) {
          return message.channel.send(
            `${message.client.emojis.resolve(app.Emotes.DENY)} Unknown channel.`
          )
        }

        if (!channel.isText())
          return message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} Bad channel type. (${channel.type})`
          )

        const oldJob = app.cache.get<cron.CronJob>(slug)

        if (oldJob) {
          if (oldJob.running) oldJob.stop()
          app.cache.delete(slug)
        }

        try {
          const job = cron.job(message.args.period, () => {
            if (channel.isText()) channel.send(message.args.content)
          })

          job.start()

          app.cache.set(slug, job)
        } catch (error) {
          return message.channel.send(
            `${message.client.emojis.resolve(
              app.Emotes.DENY
            )} Bad period pattern.\n> Check the following website to generate a valid cron period pattern. \n> http://www.cronmaker.com`
          )
        }

        await cronTable.query
          .insert({
            channel_id: message.args.channelId,
            user_id: message.author.id,
            content: message.args.content,
            period: message.args.period,
            name: message.args.name,
          })
          .onConflict("name")
          .merge()

        return message.channel.send(
          `${message.client.emojis.resolve(
            app.Emotes.CHECK
          )} Successfully saved and started.`
        )
      },
    },
    {
      name: "list",
      aliases: ["ls"],
      description: "List tasks",
      flags: [
        {
          name: "own",
          flag: "o",
          aliases: ["mine"],
          description: "Only show own cron tasks",
        },
      ],
      async run(message) {
        new app.Paginator(
          app.Paginator.divider(
            message.args.own
              ? await cronTable.query
                  .select()
                  .where("user_id", message.author.id)
              : await cronTable.query.select(),
            10
          ).map((page) => {
            return new app.MessageEmbed().setTitle("Cron list").setDescription(
              page
                .map((cron) => {
                  const job = app.cache.get<cron.CronJob>(
                    app.slug("job", cron.name)
                  )
                  return `\`${app.resizeText(
                    cron.name,
                    6,
                    true
                  )}\` | period: \`${app.resizeText(cron.period, 15)}\` | ${
                    job?.running
                      ? `${message.client.emojis.resolve(
                          app.Emotes.WAIT
                        )} Running...`
                      : `${message.client.emojis.resolve(
                          app.Emotes.MINUS
                        )} Stopped`
                  }`
                })
                .join("\n")
            )
          }),
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
