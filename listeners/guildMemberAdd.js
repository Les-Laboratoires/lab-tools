const utils = require("../utils")

async function guildMemberAdd(member) {
  if (member.user.bot) {
    await member.roles.add(utils.cobaye)
    await member.client.channels.cache
      .get(utils.general)
      .send(
        `${member.user.username} est notre nouveau cobaye! <:STONKS:772181235526533150>`
      )
  }
}

module.exports = guildMemberAdd
