import * as app from "../app"

const command: app.Command = {
  name: "counter",
  aliases: ["count", "score", "point", "pt", "c"],
  async run(message) {
    if (message.content.startsWith("list")) {
      if (message.content.includes("--debug")) {
        await message.channel.send(
          JSON.stringify(Array.from(app.scores.entries()))
        )
      }
      const lines = await Promise.all(
        app.counters.map(async (counter) => {
          const { score, id } = app.scores
            .filter(
              (score) =>
                score.hasOwnProperty(counter.name) && score[counter.name] > 0
            )
            .map((score, id) => ({ score: score[counter.name], id }))
            .sort((a, b) => b.score - a.score)[0]

          const first = await message.guild.members.fetch(id)

          return `**${counter.name}** - [${counter.type}] - \`${
            counter.target
          }\` - 1er: ***${first?.user.tag ?? "none"}*** ${
            first ? `avec \`${score}\` pts.` : ""
          }`
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
      app.scores.forEach((score, id) => {
        delete score[name]
        app.scores.set(id, score)
      })
      return message.channel.send(
        `Ok le compteur de ${name} a bien été supprimé.`
      )
    } else if (app.counters.has(message.content)) {
      const counter = app.counters.get(message.content) as app.Counter

      const leaderboard = app.scores
        .filter(
          (score) =>
            score.hasOwnProperty(counter.name) && score[counter.name] > 0
        )
        .map((score, id) => ({ score: score[counter.name], id }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((obj, i) => {
          return `\`# ${i + 1} \` | ${obj.score} pts - <@${obj.id}>`
        })
        .join("\n")

      return message.channel.send(
        new app.MessageEmbed()
          .setAuthor(`Leaderboard | ${message.content}`)
          .setDescription(leaderboard)
      )
    } else {
      return message.channel.send("Hmmmmmmm <:gneuh:557124850486083605>")
    }
  },
}

module.exports = command
