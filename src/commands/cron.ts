import * as app from "../app.js"
import cron from "cron"

import cronTable, { CronData } from "../tables/cron.js"

async function getOwnCronByName(
  message: app.NormalMessage
): Promise<CronData | null> {
  const currentCron = await cronTable.query
    .select()
    .where("name", message.args.name)
    .first()

  if (!currentCron) {
    await message.channel.send(
      `${app.emote(message, "DENY")} Unknown cron task.`
    )

    return null
  }

  if (
    currentCron.user_id !== message.author.id &&
    message.author.id !== process.env.OWNER
  ) {
    await message.channel.send(
      `${app.emote(message, "DENY")} This is not your own cron task.`
    )

    return null
  }

  return currentCron
}

export default new app.Command({
  name: "cron",
  description: "Manage cron jobs",
  channelType: "all",
  async run(message) {
    return app.sendCommandDetails(message, this)
  },
  subs: [
    new app.Command({
      name: "start",
      channelType: "guild",
      aliases: ["launch", "run", "play"],
      description: "Start a task",
      middlewares: [app.staffOnly()],
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

          const currentCron = await getOwnCronByName(message)

          if (!currentCron) return

          let job = app.cache.get<cron.CronJob>(slug)

          if (!job) {
            const channel = await message.client.channels.fetch(
              currentCron.channel_id
            )

            if (!channel) {
              // todo: remove todo task?

              return message.send(
                `${app.emote(message, "DENY")} Unknown channel.`
              )
            }

            job = cron.job(currentCron.period, () => {
              if (channel.isText()) channel.send(currentCron.content)
            })

            app.cache.set(slug, job)
          }

          if (job.running)
            return message.channel.send(
              `${app.emote(message, "DENY")} This cron is already running.`
            )

          job.start()

          return message.channel.send(
            `${app.emote(message, "CHECK")} Successfully started.`
          )
        }
      },
    }),
    new app.Command({
      name: "stop",
      aliases: ["exit", "kill"],
      description: "Stop a task",
      channelType: "guild",
      middlewares: [app.staffOnly()],
      positional: [
        {
          name: "name",
          description: "The name of task",
        },
      ],
      async run(message) {
        if (message.args.name) {
          const slug = app.slug("job", message.args.name)

          const currentCron = getOwnCronByName(message)

          if (!currentCron) return

          const job = app.cache.get<cron.CronJob>(slug)

          if (!job)
            return message.channel.send(
              `${app.emote(message, "DENY")} This cron is already stopped.`
            )

          job.stop()

          return message.channel.send(
            `${app.emote(message, "CHECK")} Successfully stopped.`
          )
        }
      },
    }),
    new app.Command({
      name: "delete",
      aliases: ["remove", "rm", "del"],
      middlewares: [app.staffOnly()],
      channelType: "guild",
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

          if (!(await getOwnCronByName(message))) return

          const job = app.cache.get<cron.CronJob>(slug)

          job?.stop()

          app.cache.delete(slug)

          await cronTable.query.delete().where("name", message.args.name)

          return message.channel.send(
            `${app.emote(message, "CHECK")} Successfully removed.`
          )
        }
      },
    }),
    new app.Command({
      name: "add",
      aliases: ["set", "create", "make"],
      middlewares: [app.staffOnly()],
      channelType: "guild",
      description: "Add a task",
      positional: [
        {
          name: "name",
          description: "The name of task",
          required: true,
        },
      ],
      options: [
        {
          name: "channel",
          castValue: "channel",
          description: "The channel of task",
          default: (message) => message?.channelId ?? "",
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
        const channel: app.AnyChannel = message.args.channel

        if (!channel.isText())
          return message.channel.send(
            `${app.emote(message, "DENY")} Bad channel type. (${channel.type})`
          )

        const oldJob = app.cache.get<cron.CronJob>(slug)

        if (oldJob) {
          if (oldJob.running) oldJob.stop()
          app.cache.delete(slug)
        }

        try {
          const job = cron.job(message.args.period, () => {
            if (channel?.isText()) channel.send(message.args.content)
          })

          job.start()

          app.cache.set(slug, job)
        } catch (error) {
          return message.channel.send(
            `${app.emote(
              message,
              "DENY"
            )} Bad period pattern.\n> Check the following website to generate a valid cron period pattern. \n> http://www.cronmaker.com`
          )
        }

        await cronTable.query
          .insert({
            channel_id: message.args.channel.id,
            user_id: message.author.id,
            content: message.args.content,
            period: message.args.period,
            name: message.args.name,
          })
          .onConflict("name")
          .merge()

        return message.channel.send(
          `${app.emote(message, "CHECK")} Successfully saved and started.`
        )
      },
    }),
    new app.Command({
      name: "list",
      aliases: ["ls", "all"],
      description: "List tasks",
      channelType: "all",
      flags: [
        {
          name: "own",
          flag: "o",
          aliases: ["mine"],
          description: "Only show own cron tasks",
        },
      ],
      async run(message) {
        new app.StaticPaginator({
          pages: app
            .divider(
              message.args.own
                ? await cronTable.query
                    .select()
                    .where("user_id", message.author.id)
                : await cronTable.query.select(),
              10
            )
            .map((page) => {
              return new app.MessageEmbed()
                .setTitle("Cron list")
                .setDescription(
                  page
                    .map((cron) => {
                      const job = app.cache.get<cron.CronJob>(
                        app.slug("job", cron.name)
                      )
                      return `${
                        job?.running
                          ? `${app.emote(message, "WAIT")} Running`
                          : `${app.emote(message, "MINUS")} Stopped`
                      } | \`${app.forceTextSize(
                        cron.name,
                        10,
                        true
                      )}\` | \`${app.forceTextSize(cron.period, 15)}\` | <#${
                        cron.channel_id
                      }>`
                    })
                    .join("\n")
                )
            }),
          channel: message.channel,
          filter: (reaction, user) => {
            return message.author.id === user.id
          },
        })
      },
    }),
  ],
})
