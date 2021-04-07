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
          await redactor.roles.remove(app.validation)

          const general = await redactor.client.channels.cache.get(app.general)

          if (general?.isText()) {
            await general.send(
              `Bienvenue à ${redactor} dans l'équipe de recherches ! <:durif:565598499459039252>`,
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
                    redactor.user.displayAvatarURL({
                      dynamic: true,
                      size: 512,
                    })
                  )
              }
            )
            return general.send(`<a:labs_js:827280804233084928> Bienvenue sur Les Laboratoires JS ! <:pepeYay:557124850326437888>

- Pour nous montrer quelle techno/lang tu utilises : <#622848426484432952>
- Pour aider ou te faire aider : <#622382324880900096> <#622382349426098200> (etc...)
- Pour parcourir notre réseau : <#620661794410856451> <#713850539368251533> - Pour utiliser des commandes : <#620663106250604546> <#620663121622859776> (etc...)
- Pour poser des questions rapides : <#622382556192571416>
- Pour nos tips JS : <#627239007440338954>
- Pour apprendre le JS : <#622381685820096512>

Nous te souhaitons un excellent séjour parmi nous ! <:ghom:641033765065326640>`)
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
