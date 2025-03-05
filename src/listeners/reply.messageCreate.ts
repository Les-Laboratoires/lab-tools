import { Listener } from "#core/listener"
import { replies } from "#namespaces/reply"
import { getGuild } from "#namespaces/tools"

export default new Listener({
  event: "messageCreate",
  description: "A messageCreate listener for reply",
  async run(message) {
    if (message.author.bot || !message.guild) return

    const guild = await getGuild(message.guild)

    if (!guild) return

    const reply = await replies.get(String(guild._id), guild._id)

    if (reply.length === 0) return

    const replyMatch = reply.filter((r) => {
      if (
        !r.channel ||
        r.channel === "all" ||
        r.channel === message.channel.id
      ) {
        return !r.pattern || new RegExp(r.pattern).test(message.content)
      }
      return false
    })

    for (const r of replyMatch) {
      await message.channel.send(r.message)
    }
  },
})
