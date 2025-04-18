const path = require("node:path")

module.exports = {
	apps: [
		{
			name: "tool",
			script: path.join(__dirname, "src/index.ts"),
			interpreter: "bun",
			env: {
				PATH: `~/.bun/bin:${process.env.PATH}`,
			},
		},
	],
}
