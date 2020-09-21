# Collaboration rules

## Github

- Créez votre propre branche avec un nom spécifiant la modification que vous voulez apporter. Exemple pour une commande "help": `git checkout -b help-command`
- Créez une pull request depuis Github seulement quand vous avez fini de coder entièrement votre modification.
- Laissez [CamilleAbella](https://github.com/CamilleAbella) faire le merge.

## Coding style

- Utilisez la commande prettier avant chaque commit sur votre branche: `npm run prettier`.
- Si vous voulez accéder à quelque chose dans tout le programme, placez-le dans l'objet `client`.
- Documentez à fond chaque util que vous ajoutez via du JSDoc, pas besoin de documenter les commandes.

## Command

- Exportez votre commande dans les règles du CommonJS: `module.exports = command`
- Placez `return false` dans une commande pour signifier qu'elle n'a pas été ciblée.
- Si la commande ne renvoie rien (ou autre chose que `false`), le command handler en déduis que la commande a été ciblée.
- Placez `.catch(client.throw)` après une Promise pour la debug sans trop écrire de code.

### Command Type

```ts
type Command = (message: Discord.Message) => false | any
```

### Command Example

```js
// ./commands/say.js
module.exports = (message) => {
  if (!message.content) return false

  message.delete().catch(client.throw).then(() => {
    message.channel.send(message.content).catch(client.throw)
  })
}
```

## Database

- On utilise Enmap pour la base de données.
- Chaque donnée utilisée en base de donnée doit être préfixée par le nom de la feature qui l'utilise.

### Database Usage Examples

```js
// ./commands/autorole.js
const db = require("./utils/db")

module.exports = (message) => {
  // ...command args processing...
  db.ensure("autorole", role.id)
}
```

```js
// ./commands/todo.js
const db = require("./utils/db")

module.exports = (message) => {
  // ...command args processing...
  db.ensure("todo", todo, user.id)
}
```

## Local Run

- Clonez le repo sur votre disque.
- Installez les build-essentials si vous ne les avez pas déjà.
  - Linux: `sudo apt-get install build-essential`
  - Windows: `npm i -g --add-python-to-path --vs2015 --production windows-build-tools`
- Installez les dépendances: `npm i`
- Créez un fichier `.env` à la racine du projet et placez votre token de test dedans de cette façon: `TOKEN=token`.
- Lancez avec la commande `npm start`.
