import * as app from "#app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  description: "Update the tracker",
  async run(member) {
    await app.updateGuildMemberCountTracker(member.guild)
  },
}

export default listener
