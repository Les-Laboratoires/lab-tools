const path = require("node:path")

module.exports = {
	apps: [
		{
			name: "tool",
			script: "start",
			interpreter: "bun",
			cwd: __dirname,
			env: {
				PATH: `~/.bun/bin:${process.env.PATH}`,
			},
		},
	],
}
