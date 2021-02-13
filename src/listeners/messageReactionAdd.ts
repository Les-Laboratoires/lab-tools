import * as app from "../app"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async call(reaction, user) {
    // presentations
    if (reaction.message.channel.id === app.presentations) {
      const authorMember = reaction.message.guild?.members.resolve(user.id)
      const targetMember = await reaction.message.guild?.members.fetch(
        reaction.message.author.id
      )

      if (
        user.bot ||
        !authorMember ||
        !targetMember ||
        !app.isStaff(authorMember) ||
        reaction.message.author.bot ||
        targetMember.roles.cache.has(app.dickHead)
      )
        return

      if (reaction.emoji.id === app.approved) {
        if (reaction.message.author === user) {
          return reaction.users.remove(user)
        } else if (!targetMember.roles.cache.has(app.dickHead)) {
          const disapproved = reaction.message.reactions.cache.get(
            app.disapproved
          )

          if (disapproved) await disapproved.remove()

          await targetMember.roles.add(app.dickHead)
          await targetMember.roles.remove(app.validation)

          const general = await targetMember.client.channels.cache.get(
            app.general
          )

          if (general?.isText()) {
            return general.send(
              `Bienvenue à ${targetMember} dans l'équipe de recherches ! <:durif:565598499459039252>`,
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
                    targetMember.user.displayAvatarURL({
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
        if (!targetMember.roles.cache.has(app.dickHead)) {
          await targetMember.kick()
          return reaction.message.delete()
        }
      }
    }
  },
}

module.exports = listener
