import * as app from "../app"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async call(reaction, user) {
    // pagination
    const paginator = app.Paginator.getByMessage(reaction.message)
    if (paginator && !user.bot) {
      const message = reaction.message
      const guild = message.guild
      if (guild) paginator.handleReaction(reaction, user)
      return
    }

    // presentations
    if (reaction.message.channel.id === app.presentations) {
      const reactor = await reaction.message.guild?.members.fetch(
        user as app.User
      )
      const redactor = await reaction.message.guild?.members.fetch(
        reaction.message.author
      )

      if (
        user.bot ||
        !reactor ||
        !redactor ||
        redactor.user.bot ||
        !app.isStaff(reactor) ||
        redactor.roles.cache.has(app.justAMember)
      )
        return

      if (reaction.emoji.id === app.approved) {
        if (reaction.message.author === user) {
          return reaction.users.remove(user)
        } else if (!redactor.roles.cache.has(app.justAMember)) {
          const disapproved = reaction.message.reactions.cache.get(
            app.disapproved
          )

          if (disapproved) await disapproved.remove()

          await redactor.roles.add(app.justAMember)
          await redactor.roles.add("832615381377089546")
          await redactor.roles.add("832620331969413191")
          await redactor.roles.add("832613931893260350")
          await redactor.roles.add("824924421818023956")
          await redactor.roles.add("824924771065659402")
          await redactor.roles.add("828648602381451314")
          await redactor.roles.remove(app.validation)

          const general = await redactor.client.channels.cache.get(app.general)

          if (general?.isText()) {
            await general.send(
              new app.MessageEmbed()
                .setAuthor(
                  `${redactor.displayName} vient de se présenter !`,
                  reaction.message.guild?.iconURL({
                    dynamic: true,
                    size: 64,
                  }) ?? undefined
                )
                .setDescription(reaction.message.content)
                .setThumbnail(
                  redactor.user.displayAvatarURL({
                    dynamic: true,
                  })
                )
            )

            return general.send(
              new app.MessageEmbed().setTitle(
                "Bienvenue sur Les Laboratoires JS !"
              ).setDescription(`
- Gêrer tes rôles : <#622848426484432952>
- L'entraide : <#622382324880900096> <#622382349426098200> (etc...)
- Notre réseau : <#620661794410856451> <#713850539368251533>
- Utiliser des commandes : <#620663106250604546> <#620663121622859776> (etc...)
- Questions rapides : <#622382556192571416>
- Apprendre le JS : <#622381685820096512>
- Tips JS : <#627239007440338954>

Nous te souhaitons un excellent séjour parmi nous ! <:pepeYay:557124850326437888>`)
            )
          }
        }
      } else if (reaction.emoji.id === app.disapproved) {
        if (!redactor.roles.cache.has(app.justAMember)) {
          const logChannel = reaction.message.guild?.channels.cache.get(
            app.logChannel
          )

          if (logChannel && logChannel.isText())
            logChannel.send(
              `${user} a désapprouvé la présentation de ${
                reaction.message.author
              }. ${app.toCodeBlock(reaction.message.content)}`
            )

          await redactor.kick()
          return reaction.message.delete()
        }
      }
    }
  },
}

module.exports = listener
