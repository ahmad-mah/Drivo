import http from "node:http";
import app from "./app";
import { env, connectDatabase, disconnectDatabase } from "./config";
import {
  RIDE_EXPIRY_SWEEP_INTERVAL_MS,
  STUCK_TRIP_LOG_INTERVAL_MS,
} from "./config";
import { initSocketServer } from "./sockets";
import * as rideService from "./modules/rides/ride.service";
import { startFakeDriversSimulator } from "./modules/drivers/fake-drivers.simulator";
import { startFakeDriverMatchingSimulator } from "./modules/rides/fake-driver.simulator";
import { startRideDispatcher } from "./modules/rides/ride-dispatcher";

await connectDatabase();

const server = http.createServer(app);
initSocketServer(server);
// The simulated fleet is env-gated so real-device testing gets a clean map
// and dispatch; flipping DISABLE_FAKE_DRIVERS restores the old behavior.
if (!env.DISABLE_FAKE_DRIVERS) {
  startFakeDriversSimulator();
  startFakeDriverMatchingSimulator();
}
startRideDispatcher();

setInterval(() => {
  void rideService.expireOverdueRides();
}, RIDE_EXPIRY_SWEEP_INTERVAL_MS);

// Observability only — matched rides abandoned by their driver surface in the
// logs instead of silently blocking the rider's "one active ride" invariant.
setInterval(() => {
  void rideService.logStuckTrips();
}, STUCK_TRIP_LOG_INTERVAL_MS);

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
