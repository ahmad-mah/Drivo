import http from "node:http";
import app from "./app";
import { env, connectDatabase, disconnectDatabase } from "./config";
import { RIDE_EXPIRY_SWEEP_INTERVAL_MS } from "./config";
import { initSocketServer } from "./sockets";
import * as rideService from "./modules/rides/ride.service";
import { startFakeDriversSimulator } from "./modules/drivers/fake-drivers.simulator";
import { startFakeDriverMatchingSimulator } from "./modules/rides/fake-driver.simulator";

await connectDatabase();

const server = http.createServer(app);
initSocketServer(server);
startFakeDriversSimulator();
startFakeDriverMatchingSimulator();

setInterval(() => {
  void rideService.expireOverdueRides();
}, RIDE_EXPIRY_SWEEP_INTERVAL_MS);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  server.close(() => process.exit(1));
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
