import * as app from "../app"

const command: app.Command = {
  name: "counter",
  aliases: ["count", "score", "c"],
  async run(message) {
    if (app.counters.has(message.content)) {
      const counter = app.counters.get(message.content) as app.Counter

      const leaderboard = app.profiles
        .filter(
          (profile) =>
            profile.scores.hasOwnProperty(counter.name) &&
            profile.scores[counter.name] > 0
        )
        .map((profile, id) => ({ score: profile.scores[counter.name], id }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((el, i, arr) => app.leaderItem(el, i, arr, "pts"))
        .join("\n")

      return message.channel.send(
        new app.MessageEmbed()
          .setAuthor(`Leaderboard | ${message.content}`)
          .setDescription(leaderboard)
      )
    } else if (message.mentions.members && message.mentions.members.size > 0) {
      const target = message.mentions.members.first() as app.GuildMember

      const profile = app.getProfile(target.id)

      return message.channel.send(
        new app.MessageEmbed()
          .setTitle(`Scores | ${target.user.tag}`)
          .setDescription(
            app.code(
              JSON.stringify(profile.scores, null, 2).replace(/"/g, ""),
              "js"
            )
          )
          .addField(
            "total",
            `**${
              eval(Object.values(profile.scores).join(" + ")) || 0
            }** points.`
          )
      )
    } else {
      return message.channel.send(
        new app.MessageEmbed().setAuthor(`Leaderboard | Total`).setDescription(
          app.profiles
            .map((profile, id) => ({
              id,
              score: eval(Object.values(profile.scores).join(" + ")),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 15)
            .map((el, i, arr) => app.leaderItem(el, i, arr, "pts"))
            .join("\n")
        )
      )
    }
  },
  subs: [
    {
      name: "list",
      aliases: ["ls"],
      async run(message) {
        const lines = app.counters.map((counter) => {
          return `**${counter.name}** - [${counter.type}] - \`${counter.target}\``
        })

        return message.channel.send(
          lines.join("\n") || "Aucun compteur ajouté."
        )
      },
    },
    {
      name: "add",
      aliases: ["push"],
      args: [
        {
          name: "name",
          required: true,
        },
        {
          name: "target",
          aliases: ["match", "pattern", "emoji", "emote", "regex"],
          required: true,
        },
        {
          name: "reaction",
          aliases: ["r", "react"],
          flag: true,
        },
      ],
      async run(message) {
        if (message.guild.ownerID !== message.author.id) {
          return message.channel.send("Raté, ya que Ghom qui peut faire ça !")
        }

        const type = message.args.reaction ? "react" : "match"
        const { name, target } = message.args

        if (!name || !target) {
          return message.channel.send(
            "Raté, ça s'utilise comme ça:\n`!counter add [name] match|react [pattern|emoji]`"
          )
        }

        app.counters.set(name, { name, type, target })

        return message.channel.send(`Le compteur de ${name} a bien été ajouté.`)
      },
    },
    {
      name: "remove",
      aliases: ["rm", "delete", "del"],
      async run(message) {
        const name = message.args[0]

        if (!name)
          return message.channel.send("Il manque le nom du compteur...")

        if (!app.counters.has(name))
          return message.channel.send(`Le compteur de ${name} n'existe pas.`)

        app.counters.delete(name)

        app.profiles.forEach((profile) => {
          delete profile.scores[name]

          app.setProfile(profile)
        })

        return message.channel.send(
          `Ok le compteur de ${name} a bien été supprimé.`
        )
      },
    },
    {
      name: "me",
      async run(message) {
        const me = app.getProfile(message.author.id)

        return message.channel.send(
          new app.MessageEmbed()
            .setTitle(`Scores | ${message.author.tag}`)
            .setDescription(
              app.code(
                JSON.stringify(me.scores, null, 2).replace(/"/g, ""),
                "js"
              )
            )
            .addField(
              "total",
              `**${eval(Object.values(me.scores).join(" + "))}** points.`
            )
        )
      },
    },
  ],
}

module.exports = command
