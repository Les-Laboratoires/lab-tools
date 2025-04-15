import discord from "discord.js"

import * as ladder from "#namespaces/ladder"

import database from "#core/database"

import activeTable from "#tables/active"
import guildTable from "#tables/guild"
import messageTable from "#tables/message"
import pointTable from "#tables/point"
import noteTable from "#tables/rating"
import userTable from "#tables/user"

import { ResponseCache } from "@ghom/orm"
import { forceTextSize } from "#core/util"

// import { ResponseCache } from "#core/database"

export type CoinLadderLine = {
	rank: number
	coins: number
	user_id: string
}

export const coinLadder = new ladder.Ladder({
	title: "Wealthiest members",
	fetchLineCount() {
		return userTable.count('"coins" > 0')
	},
	async fetchLines(options) {
		return userTable.query
			.select(
				"coins",
				database.raw('rank() over (order by coins desc) as "rank"'),
				"id as user_id",
			)
			.where("coins", ">", 0)
			.limit(options.pageLineCount)
			.offset(options.pageIndex * options.pageLineCount)
			.then((rows) => rows as unknown as CoinLadderLine[])
	},
	formatLine(line, _, lines) {
		return `${ladder.formatRank(line.rank)} \`${forceTextSize(
			line.coins,
			Math.max(...lines.map((l) => String(l.coins).length)),
			true,
		)}🪙\` - ${discord.userMention(line.user_id)}`
	},
})

export interface FullUser {
	_id: number
	id: string
	coins: number // sum(coins)
	points: number // sum(amount) rel(to_id)
	rating: number // avg(value) rel(to_id)
	rateOthers: number // count(rating.*) rel(from_id)
	active: boolean // exists? in guild_id rel(user_id)
	messages: number // count(message.*) in guild_id rel(author_id)
}

export async function giveHourlyCoins() {
	const pointTotalsSubquery = pointTable.query
		.select("to_id")
		.sum("amount as points")
		.groupBy("to_id")
		.as("point_totals")

	const notesSubquery = noteTable.query
		.select("to_id")
		.avg("value as rating")
		.groupBy("to_id")
		.as("notes")

	const givenNotesSubquery = noteTable.query
		.select("from_id")
		.count("* as total")
		.groupBy("from_id")
		.as("given_notes")

	const messageTotalsSubquery = messageTable.query
		.select("author_id")
		.count("* as messages")
		.groupBy("author_id")
		.as("message_totals")

	const eligibleUsers = await userTable.query
		.leftJoin(pointTotalsSubquery, "point_totals.to_id", "user._id")
		.leftJoin(notesSubquery, "notes.to_id", "user._id")
		.leftJoin(givenNotesSubquery, "given_notes.from_id", "user._id")
		.leftJoin("active", "active.user_id", "user._id")
		.leftJoin(messageTotalsSubquery, "message_totals.author_id", "user._id")
		.select("user._id")
		.where("point_totals.points", ">", 0)
		.or.where("notes.rating", ">", 0)
		.or.where("given_notes.total", ">", 0)
		.orWhere((query) =>
			query
				.where("active.user_id", "is not", null)
				.andWhere("message_totals.messages", ">", 0),
		)
		.pluck("_id")

	await userTable.query.whereIn("_id", eligibleUsers).update({
		coins: userTable.orm!.raw(`
			CEIL(coins + (
				COALESCE((SELECT SUM(amount) FROM point WHERE to_id = "user"._id), 0) * 
				GREATEST(1, COALESCE((SELECT AVG(value) FROM note WHERE to_id = "user"._id), 0)) +
				COALESCE((SELECT COUNT(*) FROM note WHERE from_id = "user"._id), 0) * 5 +
				CASE 
					WHEN EXISTS(SELECT 1 FROM active WHERE user_id = "user"._id) 
					THEN GREATEST(10, FLOOR(COALESCE((SELECT COUNT(*) FROM message WHERE author_id = "user"._id), 0) * 0.001))
					ELSE 0
				END
			))
		`),
	})
}

export function getUserHourlyCoins(user: FullUser): number {
	return (
		+user.points * Math.max(1, +user.rating) +
		+user.rateOthers * 5 +
		(user.active ? Math.max(10, Math.floor(+user.messages * 0.001)) : 0)
	)
}

const fullUserCache = new ResponseCache(
	async (userId: number, guildId: number) => {
		// 1. Récupérer les informations de base de l'utilisateur
		const user = await userTable.query
			.select("_id", "id", "coins")
			.where("_id", userId)
			.first()

		if (!user) {
			return null // Si l'utilisateur n'existe pas
		}

		// 2. Calculer la somme des points reçus par l'utilisateur (table `point`)
		const points = await pointTable.query
			.sum({ points: "amount" })
			.where("to_id", userId)
			.first()

		// 3. Calculer la moyenne des évaluations reçues (table `rating`) dans la guilde
		const rating = await noteTable.query
			.avg({ rating: "value" })
			.where("to_id", userId)
			.andWhere("guild_id", guildId)
			.first()

		// 4. Compter le nombre d'évaluations faites par l'utilisateur (table `rating`)
		const rateOthers = await noteTable.query
			.count({ rateOthers: "*" })
			.where("from_id", userId)
			.first()

		// 5. Vérifier si l'utilisateur est actif dans la guilde (table `active`)
		const active = await activeTable.query
			.select("user_id")
			.where("user_id", userId)
			.andWhere("guild_id", guildId)
			.first()

		// 6. Compter le nombre de messages envoyés par l'utilisateur dans la guilde (table `message`)
		const messages = await messageTable.query
			.count({ messages: "*" })
			.where("author_id", userId)
			.andWhere("guild_id", guildId)
			.first()

		// Assemblage du résultat final
		return {
			_id: user._id,
			id: user.id,
			coins: Number(user.coins),
			points: Number(points?.points || 0), // Valeur par défaut à 0 si pas de points
			rating: Number(rating?.rating || 0), // Valeur par défaut à 0 si pas d'évaluation
			rateOthers: Number(rateOthers?.rateOthers || 0), // Valeur par défaut à 0
			active: !!active, // Convertit en booléen
			messages: Number(messages?.messages || 0), // Valeur par défaut à 0 si pas de messages
		}
	},
	6_000_000,
)

export async function getFullUser(user: { id: string }, guild: { id: string }) {
	const userId = await userTable.cache.get(
		`user.id.${user.id}`,
		async (query) => {
			return query
				.select("_id")
				.where("id", user.id)
				.first()
				.then((user) => user?._id)
		},
	)

	const guildId = await guildTable.cache.get(
		`guild.id.${guild.id}`,
		async (query) => {
			return query
				.select("_id")
				.where("id", guild.id)
				.first()
				.then((guild) => guild?._id)
		},
	)

	if (!userId || !guildId) return null

	return fullUserCache.get(user.id, userId, guildId)
}
