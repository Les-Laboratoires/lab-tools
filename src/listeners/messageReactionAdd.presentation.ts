import * as app from "../app"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async run(reaction, user) {
    if (reaction.message.channel.id === app.Channels.PRESENTATION) {
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
        !reactor.roles.cache.has(app.Roles.STAFF) ||
        redactor.roles.cache.has(app.Roles.MEMBER)
      )
        return

      if (reaction.emoji.id === app.Emotes.APPROVED) {
        if (reaction.message.author === user) {
          return reaction.users.remove(user)
        } else if (!redactor.roles.cache.has(app.Roles.MEMBER)) {
          const disapproved = reaction.message.reactions.cache.get(
            app.Emotes.DISAPPROVED
          )

          if (disapproved) await disapproved.remove()

          await redactor.roles.add(app.Roles.MEMBER)
          await redactor.roles.add(app.Roles.EVENT_NOTIFICATION)
          await redactor.roles.add(app.Roles.SURVEY_NOTIFICATION)
          await redactor.roles.add(app.Roles.ANNOUNCE_NOTIFICATION)
          await redactor.roles.add(app.Roles.HELP_ACCESS)
          await redactor.roles.add(app.Roles.LABS_ACCESS)
          await redactor.roles.add(app.Roles.SHARE_ACCESS)
          await redactor.roles.remove(app.Roles.VALIDATION)

          const general = await redactor.client.channels.cache.get(
            app.Channels.GENERAL
          )

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
      } else if (reaction.emoji.id === app.Emotes.DISAPPROVED) {
        if (!redactor.roles.cache.has(app.Roles.MEMBER)) {
          const logChannel = reaction.message.guild?.channels.cache.get(
            app.Channels.LOG
          )

          if (logChannel && logChannel.isText())
            logChannel.send(
              `${user} a désapprouvé la présentation de ${
                reaction.message.author
              }. ${app.code.stringify({ content: reaction.message.content })}`
            )

          await redactor.kick()
          return reaction.message.delete()
        }
      }
    }
  },
}

module.exports = listener
