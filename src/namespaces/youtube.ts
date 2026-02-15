import { youtube } from "@googleapis/youtube"
import env from "#core/env"
import youtubeTable from "#tables/youtube"

export function checkYoutubeNEWS(guildId: number) {
	const entries = youtubeTable.query
		.select("*")
		.where("guild_id", guildId)
		.andWhere((query) =>
			query.whereNotNull("channel_url").orWhereNotNull("playlist_url"),
		)
		.first()

	const youtubeClient = youtube({
		version: "v3",
		auth: env.YOUTUBE_API_KEY,
	})

	// todo
}
