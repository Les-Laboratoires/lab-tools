import { Listener } from "#core/listener"

export default new Listener({
	event: "clientReady",
	description: "Launches the live monitoring",
	once: true,
	async run() {
		import("#namespaces/monitoring").then((monit) => monit.initMonitoring())
	},
})
