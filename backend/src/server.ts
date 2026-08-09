import http from "node:http";
import app from "./app";
import { env, connectDatabase, disconnectDatabase } from "./config";
import { initSocketServer } from "./sockets";

await connectDatabase();

// Socket.io attaches to the raw HTTP server, not the Express app itself.
const server = http.createServer(app);
initSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);

  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error(err);

  process.exit(1);
});

process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});