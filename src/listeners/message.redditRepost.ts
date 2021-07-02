import * as app from "../app"

import fetch from "node-fetch"
import URL from "url"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (message.webhookID && message.channel.id === app.Channels.MEMES) {
      if (
        message.embeds[0].url &&
        message.embeds[0].title === "New link post"
      ) {
        const url = new URL.URL("https://api.repostsleuth.com/image")

        url.searchParams.append("filter", "true")
        url.searchParams.append("url", message.embeds[0].url)
        url.searchParams.append("postId", message.embeds[0].url.split("/")[4])
        url.searchParams.append("same_sub", "true")
        url.searchParams.append("filter_author", "true")
        url.searchParams.append("only_older", "false")
        url.searchParams.append("include_crossposts", "false")
        url.searchParams.append("meme_filter", "false")
        url.searchParams.append("target_match_percent", "90")
        url.searchParams.append("filter_dead_matches", "false")
        url.searchParams.append("target_days_old", "0")

        const alreadyExists = await fetch(url)
          .then((res) => res.json())
          .then((body) => body?.matches?.length >= 1)

        if (alreadyExists) {
          await message.delete()
          return message.channel.send(`*Report detected. ||${url}||*`)
        } else return message.react(app.Emotes.APPROVED)
      }
    }
  },
}

module.exports = listener
