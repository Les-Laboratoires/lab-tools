import * as app from "#app"

export default new app.Listener({
  event: "guildMemberRemove",
  description: "Update the tracker",
  async run(member) {
    await app.updateGuildMemberCountTracker(member.guild)
  },
})
