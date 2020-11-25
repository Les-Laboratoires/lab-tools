import * as app from "../app"

const command: app.Command = {
  name: "teleport",

  async run(message) {
    const categories = message.guild.channels.cache
      .filter((channel) => channel.type === "category")
      .map((channel) => channel as app.CategoryChannel)
      .sort((a, b) => a.position - b.position)

    const targets: (app.TextChannel & app.GuildChannel)[] = []

    for (const category of categories) {
      if (!category.permissionsFor(message.member)?.has("VIEW_CHANNEL")) {
        continue
      }

      const children = category.children
        .filter((child) => child.type === "text")
        .filter(
          (child) => !!child.permissionsFor(message.member)?.has("VIEW_CHANNEL")
        )
        .sort((a, b) => a.position - b.position)
      if (category.position > message.channel.position) {
        targets.push(children.first() as app.TextChannel)
      } else {
        targets.push(children.last() as app.TextChannel)
      }
    }

    const embed = new app.MessageEmbed()
      .setTitle("Zaap des labs")
      .setDescription(
        targets
          .map((target) => {
            const category = categories.find((cat) =>
              cat.children.has(target.id)
            )
            return `**${category?.name ?? "bite"}**\n> <#${target.id}>`
          })
          .join("\n\n")
      )

    return message.channel.send(embed)
  },
}

module.exports = command
