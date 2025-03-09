import { Listener } from "#core/listener"
import { initMonitoring } from "#namespaces/monitoring"

export default new Listener({
  event: "ready",
  description: "Launches the live monitoring",
  once: true,
  async run() {
    initMonitoring()
  },
})
