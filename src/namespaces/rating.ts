import * as app from "#app"

import table from "#tables/rating.js"

export interface RatingLadderLine {
  target: string
  score: number
  rank: number
  rating_count: number
}

const mineRatingCount = 2

export function renderNoteValue(value: number) {
  return `**${value.toFixed(2).replace(/\.?0+$/, "")}**`
}

export function renderNoteBar(value?: number) {
  const full = "▰"
  const empty = "▱"
  const round = Math.round(value ?? 0)
  return full.repeat(round) + empty.repeat(5 - round)
}

export function renderNoteLine(value: number, count: number) {
  return `${renderNoteBar(value)}  ${renderNoteValue(value)} / 5  (*x${count}*)`
}

export const ratingLadder = (guild_id?: number) =>
  new app.Ladder<RatingLadderLine>({
    title: guild_id ? "Guild rating" : "Global rating",
    async fetchLines(options) {
      const query = table.query
        .count({ rating_count: "from_id" })
        .select([
          "user.id as target",
          app.orm.raw("rank() over (order by avg(value) desc) as rank"),
          app.orm.raw("avg(value)::float as score"),
        ])
        .leftJoin("user", "note.to_id", "user._id")
        .groupBy("user.id")
        .having(app.orm.raw("count(from_id)"), ">=", mineRatingCount)
        .where("user.is_bot", false)

      if (guild_id) query.and.where("guild_id", guild_id)

      return query
        .orderBy("score", "desc")
        .limit(options.pageLineCount)
        .offset(options.pageIndex * options.pageLineCount) as any
    },
    async fetchLineCount() {
      const query = table.query
        .leftJoin("user", "note.to_id", "user._id")
        .where("user.is_bot", "=", false)

      if (guild_id) query.and.where("guild_id", guild_id)

      return app.countOf(
        query
          .groupBy("user._id")
          .having(app.orm.raw("count(*)"), ">=", mineRatingCount),
      )
    },
    formatLine(line) {
      return `${app.formatRank(line.rank)} ${renderNoteLine(
        line.score,
        line.rating_count,
      )}  <@${line.target}>`
    },
  })

export async function userRating(
  user: { id: string },
  guild?: { id: string },
): Promise<{
  avg: number
  count: number
}> {
  const { _id: userId } = await app.getUser(user, true)

  const query = table.query.where("to_id", userId)

  if (guild) {
    const { _id: guildId } = await app.getGuild(guild, true)

    query.and.where("guild_id", guildId)
  }

  return await query
    .avg({ score: "value" })
    .count({ rating_count: "*" })
    .first()
    .then((result) => ({
      avg: Number(result?.score ?? 0),
      count: Number(result?.rating_count ?? 0),
    }))
}

export async function ratingEmbed(target: app.GuildMember) {
  const guildRating = await userRating(target, target.guild)
  const globalRating = await userRating(target)

  const externalRating = (
    await Promise.all(
      target.client.guilds.cache
        .filter(
          (guild) =>
            guild.id !== target.guild.id && guild.members.cache.has(target.id),
        )
        .map(async (guild) => ({
          guild,
          rating: await userRating(target, guild),
        })),
    )
  ).filter(({ rating }) => rating.count > 0)

  const embed = new app.EmbedBuilder()
    .setAuthor({
      name: `Rating of ${target.user.tag}`,
      iconURL: target.displayAvatarURL(),
    })
    .setDescription(
      "You can rate a user by using the `rating` command. \n" +
        "The rating is a number between 0 and 5.",
    )

  const fields: app.EmbedField[] = [
    {
      name: "Global rating",
      value: renderNoteLine(globalRating.avg, globalRating.count),
      inline: false,
    },
  ]

  if (
    guildRating.count > 0 &&
    guildRating.avg !== globalRating.avg &&
    guildRating.count !== globalRating.count
  ) {
    fields.push({
      name: target.guild.name,
      value: renderNoteLine(guildRating.avg, guildRating.count),
      inline: false,
    })
  }

  if (externalRating.length > 0) {
    fields.push({
      name: "External ratings",
      value: externalRating
        .map(
          ({ rating, guild }) =>
            `${renderNoteLine(rating.avg, rating.count)} - **${guild.name}**`,
        )
        .join("\n"),
      inline: false,
    })
  }

  if (fields.length > 0) embed.addFields(fields)

  return embed
}
