import * as app from "../app"
import autoRole from "../tables/autoRole"

module.exports = new app.Command({
  name: "autoRole",
  aliases: ["ar", "autorole"],
  description: "Manage the auto roles",
  channelType: "all",
  async run(message) {
    return app.sendCommandDetails(message, this)
  },
  subs: [
    new app.Command({
      name: "set",
      description: "Set auto role list",
      channelType: "guild",
      middlewares: [app.staffOnly()],
      positional: [
        {
          name: "roles",
          castValue: "array",
          required: true,
          description: "Role list",
        },
      ],
      flags: [
        {
          name: "bot",
          aliases: ["for-bot", "bot-only"],
          description: "Is auto roles for bots",
          flag: "b",
        },
      ],
      async run(message) {
        await autoRole.query.delete().where("guild_id", message.guild.id)
        await autoRole.query.insert(
          message.args.roles.map((roleId: string) => {
            return {
              guild_id: message.guild.id,
              role_id: roleId,
              bot: message.args.bot,
            }
          })
        )

        return message.send(
          `${app.emote(message, "CHECK")} Auto-roles are successfully pushed.`
        )
      },
    }),
    new app.Command({
      name: "add",
      description: "Add auto role",
      channelType: "guild",
      middlewares: [app.staffOnly()],
      positional: [
        {
          name: "role",
          castValue: "role",
          required: true,
          description: "Role to add",
        },
      ],
      flags: [
        {
          name: "bot",
          aliases: ["for-bot", "bot-only"],
          description: "Is bot auto-role",
          flag: "b",
        },
      ],
      async run(message) {
        await autoRole.query.insert({
          guild_id: message.guild.id,
          role_id: message.args.role.id,
          bot: message.args.bot,
        })

        return message.send(
          `${app.emote(message, "CHECK")} Auto-role is successfully pushed.`
        )
      },
    }),
    new app.Command({
      name: "list",
      aliases: ["ls"],
      description: "List auto roles",
      channelType: "guild",
      async run(message) {
        const autoRoles = await autoRole.query.where(
          "guild_id",
          message.guild.id
        )

        return message.send(
          new app.MessageEmbed()
            .setColor("BLURPLE")
            .setTitle("Auto-role list")
            .addField(
              "Member auto roles",
              autoRoles
                .filter((ar) => !ar.bot)
                .map((ar) => `<@&${ar.role_id}>`)
                .join(" ") || "No role setup here."
            )
            .addField(
              "Bot auto roles",
              autoRoles
                .filter((ar) => ar.bot)
                .map((ar) => `<@&${ar.role_id}>`)
                .join(" ") || "No role setup here."
            )
        )
      },
    }),
    new app.Command({
      name: "apply",
      description: "Apply auto-roles to member",
      middlewares: [app.staffOnly()],
      channelType: "guild",
      positional: [
        {
          name: "target",
          description: "Target member",
          required: true,
          castValue: "member",
        },
      ],
      async run(message) {
        const target: app.GuildMember = message.args.target

        const autoRoles = await autoRole.query
          .where("guild_id", message.guild.id)
          .and.where("bot", target.user.bot)

        for (const autoRole of autoRoles)
          await target.roles.add(autoRole.role_id).catch()

        return message.send(
          `${app.emote(
            message,
            "CHECK"
          )} Auto-roles are successfully applied to **${target.user.tag}**.`
        )
      },
    }),
  ],
})
