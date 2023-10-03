import * as app from "../app.js"

export default new app.Command({
  name: "database",
  description: "Run SQL query on database",
  aliases: ["query", "db", "sql", "?"],
  botOwnerOnly: true,
  channelType: "all",
  rest: {
    name: "query",
    description: "SQL query",
    required: true,
    all: true,
  },
  async run(message) {
    const query = message.args.query
      .replace(/\$guild/g, `"${message.guild?.id}"`)
      .replace(/\$channel/g, `"${message.channel.id}"`)
      .replace(/\$me/g, `"${message.author.id}"`)
      .replace(/<(?:[#@][&!]?|a?:\w+:)(\d+)>/g, '"$1"')

    const result = await app.db.raw(query)

    return message.send({
      embeds: [
        new app.SafeMessageEmbed()
          .setColor()
          .setTitle(
            `Result of SQL query ${
              Array.isArray(result) ? `(${result.length} items)` : ""
            }`
          )
          .setDescription(
            app.code.stringify({
              lang: "json",
              format: { printWidth: 62 },
              content: JSON.stringify(result).slice(0, 1000),
            })
          )
          .setFooter(`Result of : ${query}`),
      ],
    })
  },
  subs: [
    new app.Command({
      name: "plan",
      description: "Show database plan",
      botOwnerOnly: true,
      channelType: "all",
      aliases: ["tables", "schema", "list", "view"],
      async run(message) {
        const tables: { name: string }[] = await app.db.raw(
          "SELECT name FROM sqlite_master WHERE type='table'"
        )

        const fields = await Promise.all(
          tables.map(async ({ name }): Promise<app.EmbedFieldData> => {
            const columns: { name: string; type: string; dflt_value: any }[] =
              await app.db.raw(`PRAGMA table_info(${name})`)

            return {
              name,
              value: columns
                .map(
                  ({ name, type, dflt_value }) =>
                    `\`${name}${dflt_value ? `?` : ""}\` [${type}]`
                )
                .join("\n"),
              inline: true,
            }
          })
        )

        return message.send({
          embeds: [
            new app.SafeMessageEmbed()
              .setColor()
              .setTitle("Database plan")
              .setDescription("...infos...")
              .addFields(...fields),
          ],
        })
      },
    }),
  ],
})
