import { Listener } from "#core/listener"
import { updateGuildMemberCountTracker } from "#namespaces/tracker"

export default new Listener({
  event: "guildMemberRemove",
  description: "Update the tracker",
  async run(member) {
    await updateGuildMemberCountTracker(member.guild)
  },
})
