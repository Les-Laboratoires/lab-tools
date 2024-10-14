import * as app from "#app"

const listener: app.Listener<"afterReady"> = {
  event: "afterReady",
  description: "A afterReady listener for remind",
  async run() {
    setInterval(async () => {
      await app.checkReminds()
    }, 1000)
  },
}

export default listener
