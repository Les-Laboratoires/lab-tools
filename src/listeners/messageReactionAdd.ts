import * as app from "../app"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async call(reaction, user) {
    // add scores
    app.counters.forEach((counter) => {
      if (counter.type === "react") {
        if ((reaction.emoji.id || reaction.emoji.name) === counter.target) {
          const score = app.scores.ensure(reaction.message.author.id, {})
          score[counter.name] = (score[counter.name] ?? 0) + 1
          app.scores.set(reaction.message.author.id, score)
          if(counter.name === "help") app.transaction("bank", [message.author.id], 10)
        }
      }
    })

    // presentations
    if (reaction.message.channel.id === app.presentations) {
      const authorMember = reaction.message.guild?.members.resolve(user.id)

      if (user.bot || !authorMember || !app.isMod(authorMember)) return

      const { member } = reaction.message

      if (member) {
        await member.fetch()

        if (reaction.emoji.id === app.approved) {
          if (reaction.message.author === user) {
            return reaction.users.remove(user)
          } else if (!member.roles.cache.has(app.scientifique)) {
            const disapproved = reaction.message.reactions.cache.get(
              app.disapproved
            )

            if (disapproved) await disapproved.remove()

            await member.roles.add(app.scientifique)
            await member.roles.remove(app.validation)

            const general = await member.client.channels.cache.get(app.general)

            if (general?.isText()) {
              return general.send(
                `Bienvenue à ${member} dans l'équipe de recherches ! <:durif:565598499459039252>`,
                {
                  embed: new app.MessageEmbed()
                    .setAuthor(
                      `Description:`,
                      reaction.message.guild?.iconURL({
                        dynamic: true,
                        size: 64,
                      }) ?? undefined
                    )
                    .setDescription(reaction.message.content)
                    .setImage(
                      member.user.displayAvatarURL({ dynamic: true, size: 512 })
                    )
                    .setFooter(".bienvenue pour plus d'informations"),
                }
              )
            }
          }
        } else if (reaction.emoji.id === app.disapproved) {
          if (!member.roles.cache.has(app.scientifique)) {
            await member.kick()
            return reaction.message.delete()
          }
        }
      }
    }
  },
}

module.exports = listener
