import * as app from "#app"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  description: "Update the tracker",
  async run(member) {
    await app.updateGuildMemberCountTracker(member.guild)
  },
}

export default listener
