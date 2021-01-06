import * as app from "../app"

const command: app.Command = {
  name: "counter",
  aliases: ["count", "score", "point", "pt", "c", "sc"],
  async run(message) {
    if (message.content.startsWith("list")) {
      const lines = await Promise.all(
        app.counters.map(async (counter) => {
          return `**${counter.name}** - [${counter.type}] - \`${counter.target}\``
        })
      )

      return message.channel.send(lines.join("\n"))
    } else if (message.content.startsWith("add")) {
      if (message.guild.ownerID !== message.author.id) {
        return message.channel.send("Raté, ya que Ghom qui peut faire ça !")
      }

      message.content = message.content.replace("add", "").trim()

      const [name, type, target] = message.content.split(/\s+/)

      if (!name || (type !== "match" && type !== "react") || !target) {
        return message.channel.send(
          "Raté, ça s'utilise comme ça:\n`!counter add [name] match|react [pattern|emoji]`"
        )
      }

      app.counters.set(name, { name, type, target })

      return message.channel.send(`Le compteur de ${name} a bien été ajouté.`)
    } else if (message.content.startsWith("remove")) {
      const [, name] = message.content.split(/\s+/)

      if (!name) return message.channel.send("Il manque le nom du compteur...")

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
    } else if (message.content.startsWith("me")) {
      const me = app.getProfile(message.author.id)

      return message.channel.send(
        new app.MessageEmbed()
          .setTitle(`Scores | ${message.author.tag}`)
          .setDescription(
            app.code(JSON.stringify(me.scores, null, 2).replace(/"/g, ""), "js")
          )
          .addField(
            "total",
            `**${eval(Object.values(me.scores).join(" + "))}** points.`
          )
      )
    } else if (app.counters.has(message.content)) {
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
}

module.exports = command
