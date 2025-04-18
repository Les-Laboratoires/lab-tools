module.exports = {
	apps: [
		{
			name: "tool",
			script: "npm",
			args: ["run", "start"],
			cwd: __dirname,
		},
	],
}
