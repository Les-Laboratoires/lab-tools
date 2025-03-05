import { Listener } from "#core/listener"
import { cache, getSystemMessage } from "#core/util"
import { HELPING_URL_AS_ID } from "#namespaces/point"
import { getGuild } from "#namespaces/tools"

export default new Listener({
  event: "threadCreate",
  description: "A threadCreate listener for helping.info",
  async run(thread) {
    if (!cache.ensure<boolean>("turn", true)) return

    if (!thread.guild) return
    if (!thread.parent) return

    const guild = await getGuild(thread.guild)

    if (!guild) return

    if (thread.parent.id !== guild.help_forum_channel_id) return

    return thread.send(
      await getSystemMessage("default", {
        header: "Bienvenue sur le forum d'entraide",
        body: "Vous pouvez poser vos questions ici, n'oubliez pas de donner le plus de détails possible pour que nous puissions vous aider au mieux.",
        url: HELPING_URL_AS_ID,
      }),
    )
  },
})
