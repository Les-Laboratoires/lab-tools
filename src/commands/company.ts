import * as app from "../app"

const command: app.Command = {
  name: "company",
  aliases: ["cny"],
  async run(message) {
    let key = app.getArgument(message, [
        "list",
        "create",
        "remove",
        "join"
    ])
    
    switch(key) {
        case "create": {
          if(app.companies.find('ownerID', message.author.id)) {
            return message.channel.send('Kestufou t\'as déjà une entreprise !')
          }
          const companyName = app.getArgument(message)
          if(!companyName) return message.channel.send('Faut renseigner le nom de ton entreprise du con')
          const description = app.getArgument(message, "rest")
          const company = {
            name: companyName,
            description,
            ownerID: message.author.id,
            money: 0
          } as app.Company
          app.companies.set(companyName, company)
          return message.channel.send('Ton entreprise a été crée, jeune entrepreneur !')
        }

        case "remove": {
          const company = app.companies.find('ownerID', message.author.id)
          if(!company) {
            return message.channel.send('Je peux pas supprimer ton entreprise si t\'en a pas...')
          }
          message.channel.send('Pour confirmer, envoie `ok`, sinon, envoie `stop`')
          const collector = message.channel.createMessageCollector(() => true, { time: 60000 })
          collector
            .on('collect', m => {
              switch(m.content) {
                case "ok":
                  app.companies.delete(company.name)
                  return message.channel.send('Ok, bye bye ' + company.name)
                case "stop":
                  collector.stop()
                  return message.channel.send('Opération annulée !')
              }
            })
            .on('end', (_, reason) => 
              reason === "time" && message.channel.send('Trop lent, j\'annule la procédure')
            )
        }
        case "list":
        case "add":
        default:
            return message.channel.send(`Not yet implemented`)
    }
  },
}

module.exports = command
