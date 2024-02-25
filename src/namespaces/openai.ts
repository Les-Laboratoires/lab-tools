import OpenAI from "openai"
import discord from "discord.js"

const openai = new OpenAI()

export async function generateThreadTitle(
  thread: discord.ThreadChannel,
): Promise<string> {
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
          "Your role is to generate a title for the current topic of the thread. " +
          `The author of topic is "${threadOwner.user.username}".  ` +
          "Please generate the title in French.",
      },
      ...messages
        .filter((message) => !message.author.bot)
        .map((message) => ({
          role: "user" as const,
          name: message.author.username.replace(/\s/g, "-"),
          content: message.content,
        })),
    ],
    max_tokens: 50,
    model: "gpt-3.5-turbo",
  })

  const title = response.choices[0].message.content

  if (!title) throw new Error("An error occurred while generating the title")

  return title.replace(/\n/g, " ").replace(/"/g, "")
}
