import OpenAI from "openai"
import discord from "discord.js"
import env from "#env"

let openai: OpenAI

if (env.BOT_MODE !== "test") openai = new OpenAI()

export async function generateThreadTitle(
  thread: discord.ThreadChannel,
): Promise<string> {
  if (env.BOT_MODE === "test")
    throw new Error("OpenAI is not available in test mode")

  const messages = await thread.messages.fetch({ limit: 100 })
  const threadOwner = await thread.fetchOwner()

  if (!threadOwner || !threadOwner.user)
    throw new Error("Thread owner not found")

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "We are in a JavaScript developer helping Discord server. " +
          "Your role is to generate an accurate title for the current topic of the thread. " +
          "The generated title should represent the problem of the author of the thread. " +
          'There should be no mention of "need help" in the title, this would not be relevant in a support server. ' +
          `The author of topic is "${threadOwner.user.username}".  ` +
          "The title must be written in French.",
      },
      ...messages
        .filter((message) => !message.author.bot)
        .map((message) => ({
          role: "user" as const,
          name: message.author.username.replace(/\s/g, "-"),
          content: message.content,
        })),
      {
        role: "system",
        content: "Title: ",
      },
    ],
    max_tokens: 25,
    model: "gpt-3.5-turbo",
  })

  const title = response.choices[0].message.content

  if (!title) throw new Error("An error occurred while generating the title")

  return title.replace(/\n/g, " ").replace(/"/g, "").slice(0, 100)
}

export async function generateThreadHint(
  thread: discord.ThreadChannel,
): Promise<string> {
  if (env.BOT_MODE === "test")
    throw new Error("OpenAI is not available in test mode")

  const messages = await thread.messages.fetch({ limit: 100 })
  const threadOwner = await thread.fetchOwner()

  if (!threadOwner || !threadOwner.user)
    throw new Error("Thread owner not found")

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "We are in a JavaScript developer helping Discord server. " +
          "You are a helping bot on this Discord server. " +
          "Your role is to generate quick help on the current problem in the conversation. " +
          "Your answer must not exceed 2000 characters. " +
          "Your answer must be relevant and concise. " +
          'Please generate the answer in French if "The member we help" speak French.',
      },
      ...messages
        .filter((message) => !message.author.bot)
        .map((message) => ({
          role: "user" as const,
          name:
            message.author.id === threadOwner.id
              ? "The member we help"
              : `Another helper (${message.author.username.replace(/\s/g, "-")})`,
          content: message.content,
        })),
      {
        role: "system",
        content: "Hint: ",
      },
    ],
    max_tokens: 3000,
    model: "gpt-3.5-turbo",
  })

  const hint = response.choices[0].message.content

  if (!hint) throw new Error("An error occurred while generating the hint")

  return hint.slice(0, 2000)
}

/**
 * Demande à ChatGPT de poster une liste des liens vers des pages de documentation à propos des tags renseignés. <br>
 * La liste doit être en markdown et aussi longue que ChatGPT le veut. <br>
 * Les sources des liens doivent venir de ces sites et être en français si possible : <br>
 * - https://developer.mozilla.org/fr/
 * - https://www.typescriptlang.org/fr/docs/
 * - https://fr.react.dev/reference/react/
 * - https://nuxt.com/docs/
 * - https://fr.vuejs.org/
 * - https://discord.js.org/docs/packages/discord.js/
 * - https://nodejs.org/docs/
 * - https://svelte.dev/docs/
 * - https://nextjs.org/docs/
 * - https://www.electronjs.org/docs/
 * - https://www.mongodb.com/docs/
 * - https://www.postgresql.org/docs/
 * - https://www.npmjs.com/ (pour les readme)
 * - https://github.com/
 * etc
 */
export async function generateDocURLList(tags: string): Promise<string> {
  if (env.BOT_MODE === "test")
    throw new Error("OpenAI is not available in test mode")

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
          We are in a JavaScript developer helping Discord server.
          You are a helping bot on this Discord server.
          Your role is to generate a list of links to documentation pages about the tags provided.
          The list must be in markdown and as long as you want.
          La liste ne doit pas être trop longue, elle doit être lisible dans un message Discord.
          Each returned link must be on a new line and wrapped in <>. Example: <https://example.com>
          Please make sure than the links exist! No fake links! 
          Tu dois aussi ranger les liens par ordre d'importance et les grouper par tag relatif. Exemple:
          ### Tag 1
          - <https://example.com>
          - <https://example.com>
          ### Tag 2
          - <https://example.com>
          The sources of the links must come from these sites and be in French if possible:
          - https://developer.mozilla.org/fr/
          - https://www.typescriptlang.org/fr/docs/
          - https://fr.react.dev/reference/react/
          - https://nuxt.com/docs/
          - https://fr.vuejs.org/
          - https://discord.js.org/docs/packages/discord.js/
          - https://nodejs.org/docs/
          - https://svelte.dev/docs/
          - https://nextjs.org/docs/
          - https://www.electronjs.org/docs/
          - https://www.mongodb.com/docs/
          - https://www.postgresql.org/docs/
          - https://www.npmjs.com/ (for readme)
          - https://github.com/
          etc (add more if you need)
        `,
      },
      {
        role: "user",
        content: `Tags: ${tags}`,
      },
    ],
    max_tokens: 1500,
    model: "chatgpt-4o-latest",
  })

  const list = response.choices[0].message.content

  if (!list) throw new Error("An error occurred while generating the list")

  return list.slice(0, 2000)
}
