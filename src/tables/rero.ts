import * as app from "../app.js"

export interface ReactionRole {
  guild_id: string
  role_id: string
}

export const customId = "reaction-role-select"

const rero = new app.Table<ReactionRole>({
  name: "rero",
  description: "Represent a reaction-role",
  setup: (table) => {
    table.string("guild_id").notNullable()
    table.string("role_id").unique().notNullable()
  },
})

export async function getReactionRoleMessageOptions(guild: app.Guild) {
  const reactionRoles = await rero.query.where({
    guild_id: guild.id,
  })

  if (reactionRoles.length === 0) throw new Error("There is no reaction-role.")

  const row = new app.MessageActionRow().addComponents(
    new app.MessageSelectMenu()
      .setCustomId(customId)
      .setPlaceholder("Select a role")
      .addOptions(
        await Promise.all(
          reactionRoles.map(async (reactionRole) => {
            const role = await guild.roles.fetch(reactionRole.role_id)

            return {
              label: role?.name as string,
              value: role?.id as string,
            }
          })
        )
      )
  )

  return { content: "Select your roles!", components: [row] }
}

export default rero
