import * as app from "#app"

import point from "#tables/point.ts"
import helping, { Helping } from "#tables/helping.ts"

import upTopic from "#buttons/upTopic.ts"
import givePoints from "#buttons/givePoints.ts"
import resolveTopic from "#buttons/resolveTopic.ts"

export const HELPING_URL_AS_ID = "https://helping.fr"

export interface PointLadderLine {
  target: string
  score: number
  rank: number
}

export const pointLadder = new app.Ladder<PointLadderLine>({
  title: "Global helper scoreboard",
  async fetchLines(options) {
    return point.query
      .select([
        app.database.raw('sum("point"."amount") as "score"'),
        app.database.raw(
          'rank() over (order by sum("point"."amount") desc) as "rank"',
        ),
        "user.id as target",
      ])
      .leftJoin("user", "point.to_id", "user._id")
      .where("user.is_bot", false)
      .groupBy("user.id")
      .orderBy("score", "desc")
      .limit(options.pageLineCount)
      .offset(options.pageIndex * options.pageLineCount)
  },
  async fetchLineCount() {
    return app.countOf(
      point.query
        .distinct("to_id")
        .join("user", "point.to_id", "user._id")
        .where("user.is_bot", false)
        .groupBy("to_id"),
      "to_id",
    )
  },
  formatLine(line, index, lines) {
    return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
      String(line.score),
      Math.max(...lines.map((l) => l.score)).toString().length,
    )}\` pts - <@${line.target}>`
  },
})

export async function getPointRank(user: app.User): Promise<{ rank: string }> {
  const subquery = point.query
    .select([
      "user.id",
      app.database.raw(
        'rank() over (order by sum("point"."amount") desc) as "rank"',
      ),
    ])
    .leftJoin("user", "point.to_id", "user._id")
    .groupBy("user.id")

  const result = await app.database.database
    .select("rank")
    .from(subquery.as("ranked_users"))
    .where("id", user.id)
    .first()

  if (!result) return { rank: "N/A" }

  return { rank: result.rank }
}

export function buildHelpingFooterEmbed(
  helpers: app.User[],
  topicState: Helping | undefined,
): app.SystemMessage {
  const components = topicState?.resolved
    ? [...helpers]
        .filter((helper) => {
          return topicState
            ? !topicState.rewarded_helper_ids.split(";").includes(helper.id)
            : true
        })
        .map((helper) => {
          return givePoints
            .create({
              targetId: helper.id,
              amount: 5,
            })
            .setLabel(`Remercier ${helper.username}`)
        })
    : [upTopic.create(), resolveTopic.create()]

  return {
    embeds: [
      new app.EmbedBuilder()
        .setURL(HELPING_URL_AS_ID)
        .setDescription(
          `### ${
            topicState?.resolved
              ? `${app.getSystemEmoji("success")} Topic résolu`
              : `${app.getSystemEmoji("loading")} En attente d'aide`
          }\n${
            topicState?.resolved
              ? topicState.rewarded_helper_ids
                  .split(";")
                  .filter((id) => id !== "").length >= helpers.length
                ? helpers.length > 0
                  ? "Merci pour vos retours ! Ouvrez un nouveau topic si besoin."
                  : "Ouvrez un nouveau topic si besoin."
                : "Vous avez été bien aidé ?\nDans ce cas, remerciez le ou les membres qui vous ont aidé 😉"
              : "Vous avez trouvé une solution ?\nSi oui, merci de passer ce topic en résolu."
          }`,
        ),
    ],
    components:
      components.length > 0
        ? [
            new app.ActionRowBuilder<app.ButtonBuilder>().addComponents(
              components,
            ),
          ]
        : undefined,
  }
}

export async function refreshHelpingFooter(topic: app.ThreadChannel) {
  const helped = await topic.fetchOwner()

  if (!helped) return

  const lastMessages = await topic.messages.fetch({ limit: 100 })

  const helpers = new Set(
    lastMessages
      .map((m) => m.author)
      .filter((u) => !u.bot && u.id !== helped.id),
  )

  const ranks = await Promise.all(
    Array.from(helpers).map(async (helper) => ({
      id: helper.id,
      rank: await getPointRank(helper).then((r) => r.rank),
    })),
  )

  const bestHelpers = Array.from(helpers).sort((a, b) => {
    const rankA = ranks.find((r) => r.id === a.id)?.rank ?? Infinity
    const rankB = ranks.find((r) => r.id === b.id)?.rank ?? Infinity

    return +rankA - +rankB
  })

  const lastBotMessages = Array.from(lastMessages.values())
    .filter(
      (m) =>
        m.author.id === topic.client.user.id &&
        !m.system &&
        m.embeds.length > 0 &&
        m.embeds[0].url?.startsWith(HELPING_URL_AS_ID),
    )
    .slice(0, 3)

  try {
    await topic.bulkDelete(lastBotMessages)
  } catch (error) {
    app.error(error as Error)
  }

  const topicState = await helping.query.where("id", topic.id).first()

  if (
    topicState?.resolved &&
    topicState.rewarded_helper_ids.split(";").filter((id) => id !== "")
      .length >= helpers.size
  ) {
    await topic.setLocked(true)
  }

  await topic.send(buildHelpingFooterEmbed(bestHelpers.slice(0, 5), topicState))
}
