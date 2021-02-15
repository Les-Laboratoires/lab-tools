import * as app from "../app"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async call(reaction, user) {
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
        redactor.roles.cache.has(app.dickHead)
      )
        return

      if (reaction.emoji.id === app.approved) {
        if (reaction.message.author === user) {
          return reaction.users.remove(user)
        } else if (!redactor.roles.cache.has(app.dickHead)) {
          const disapproved = reaction.message.reactions.cache.get(
            app.disapproved
          )

          if (disapproved) await disapproved.remove()

          await redactor.roles.add(app.dickHead)
          await redactor.roles.remove(app.validation)

          const general = await redactor.client.channels.cache.get(app.general)

          if (general?.isText()) {
            return general.send(
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
                  .setFooter(".bienvenue pour plus d'informations"),
              }
            )
          }
        }
      } else if (reaction.emoji.id === app.disapproved) {
        if (!redactor.roles.cache.has(app.dickHead)) {
          await redactor.kick()
          return reaction.message.delete()
        }
      }
    }
  },
}

module.exports = listener
