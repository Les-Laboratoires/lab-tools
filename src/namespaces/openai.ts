import OpenAI from "openai"
import discord from "discord.js"

let openai: OpenAI

if (process.env.BOT_MODE !== "test") openai = new OpenAI()

export async function generateThreadTitle(
  thread: discord.ThreadChannel,
): Promise<string> {
  if (process.env.BOT_MODE === "test")
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
  if (process.env.BOT_MODE === "test")
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
              : message.author.username.replace(/\s/g, "-"),
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
