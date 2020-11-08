const utils = require("../utils")

async function mute(message){
  if(!utils.isModo(message.member)){
    return message.channel.send("T'es pas modo mon salaud!")
  }

  const target = await utils.resolveMember(message)

  if(target === message.member){
    return message.channel.send("Cible incorrecte...")
  }

  if(utils.isModo(target)){
    return message.channel.send("Ah je suis navré mais non... Fini la guéguerre entre le staff <:oui:703398234718208080>")
  }

  const muted = message.client.db.get("muted")

  if(muted.includes(target.id)){
    message.client.db.remove("muted", target.id)
    await message.channel.send(`Ok, ${target.user.username} n'est plus muted.`)
  }else{
    message.client.db.push("muted", target.id)
    await message.channel.send(`Ok, ${target.user.username} est muted.`)
  }
}

module.exports = mute