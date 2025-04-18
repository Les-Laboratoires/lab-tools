import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default {
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
