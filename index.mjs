import { app } from "./app.mjs";

const port = +(process.env.PORT || 3000)
const server = app.listen(port,'127.0.0.1',() => {
  console.log(`right!!! you make 127.0.0.1:${port}.`);
})

const shutdown = () => {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
