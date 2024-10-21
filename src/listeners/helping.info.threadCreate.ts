import * as app from "#app"

const listener: app.Listener<"threadCreate"> = {
  event: "threadCreate",
  description: "A threadCreate listener for helping.info",
  async run(thread) {
    if (!thread.guild) return
    if (!thread.parent) return

    const guild = await app.getGuild(thread.guild)

    if (!guild) return

    if (thread.parent.id !== guild.help_forum_channel_id) return

    return thread.send(
      await app.getSystemMessage("default", {
        header: "Bienvenue sur le forum d'entraide",
        body: "Vous pouvez poser vos questions ici, n'oubliez pas de donner le plus de détails possible pour que nous puissions vous aider au mieux.",
      }),
    )
  },
}

export default listener
