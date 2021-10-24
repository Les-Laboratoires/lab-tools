import * as app from "../app.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Setup paginator, etc...",
  once: true,
  async run() {
    app.Paginator.defaultEmojis = {
      start: app.Emotes.LEFT,
      previous: app.Emotes.MINUS,
      next: app.Emotes.PLUS,
      end: app.Emotes.RIGHT,
    }
  },
}

export default listener
