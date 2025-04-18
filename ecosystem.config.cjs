const path = require("node:path")

module.exports = {
	apps: [
		{
			name: "tool",
			script: path.join(__dirname, "package.json"),
			interpreter: "bun",
			env: {
				PATH: `~/.bun/bin:${process.env.PATH}`,
			},
		},
	],
}
