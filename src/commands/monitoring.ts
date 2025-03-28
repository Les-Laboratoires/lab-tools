import { Command } from "#core/command"
import { getSystemMessage } from "#core/util"
import { getMonitoringStacks } from "#namespaces/monitoring"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-command command guide} for more information.
 */
export default new Command({
  name: "monitoring",
  aliases: ["monitor", "monit"],
  description: "Manage the monitoring system",
  channelType: "guild",
  botOwnerOnly: true,
  async run(message) {
    const { errorStacks, errorCooldowns } = getMonitoringStacks()

    return message.channel.send(
      await getSystemMessage("default", {
        header: "Monitoring System Status",
        body: `Error stacks: ${errorStacks.size}\nError cooldowns: ${errorCooldowns.size}`,
        date: new Date(),
      }),
    )
  },
  subs: [
    new Command({
      name: "trigger",
      description: "Trigger an unhandled error for testing",
      channelType: "guild",
      botOwnerOnly: true,
      async run() {
        setTimeout(() => {
          throw new Error("Test error")
        }, 1000)
      },
    }),
  ],
})
