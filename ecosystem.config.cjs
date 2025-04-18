const path = require("node:path")

module.exports = {
	apps: [
		{
			name: "tool",
			script: "bun",
			apps: ["run", "start"],
			interpreter: "bun",
			cwd: __dirname,
			env: {
				PATH: `~/.bun/bin:${process.env.PATH}`,
			},
		},
	],
}
