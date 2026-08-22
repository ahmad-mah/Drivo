import * as Location from "expo-location";
import { sendLocation } from "@/api/drivers/drivers.api";
import { emitLocation, isDriverSocketConnected } from "./driver-socket";

export const DRIVER_LOCATION_TASK = "driver-location-task";

// ExpoTaskManager's build does `requireNativeModule('ExpoTaskManager')` at
// import time, which throws when the running binary predates the package (a dev
// client built before expo-task-manager was installed). A guarded module-scope
// load keeps a stale build from white-screening the app — background tracking
// is simply unavailable until the dev client is rebuilt.
let TaskManager: typeof import("expo-task-manager") | undefined;
try {
  // Intentional guarded require (see comment above) — the fallback is the point.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  TaskManager = require("expo-task-manager");
} catch {
  if (__DEV__) {
    console.warn(
      "[driver-location-task] expo-task-manager unavailable — rebuild the dev client (npx expo run:android)",
    );
  }
}

/**
 * Realtime entry point for every location update received from Expo, whether
 * the app is foregrounded (socket) or backgrounded (REST). Foreground and
 * background are two delivery mechanisms for the same location state — the
 * socket is preferred when alive, REST is the fallback.
 *
 * Only the freshest location matters to the backend: intermediate points
 * between pings add no map value, so we deliberately send the last one.
 */
TaskManager?.defineTask(DRIVER_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    if (__DEV__) console.warn("[driver-location-task] task error", error);
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] }).locations;
  const coords = locations?.[locations.length - 1]?.coords;
  if (!coords) return;

  if (isDriverSocketConnected()) {
    emitLocation(coords.latitude, coords.longitude, coords.heading ?? undefined);
    return;
  }

  try {
    await sendLocation(coords.latitude, coords.longitude, coords.heading ?? undefined);
  } catch (err) {
    // A 401 here (e.g. token provider not registered after a process restart)
    // silently drops visibility — the stale sweep will then flip the driver
    // offline. Log in dev so auth regressions surface early.
    if (__DEV__) console.warn("[driver-location-task] REST fallback failed", err);
  }
});

/**
 * Starts background location streaming once the driver is online. The task
 * delivers updates in the foreground too, so this is the single location
 * source for the online session.
 *
 * `distanceInterval`/`timeInterval` are upper-bound thresholds, not a promise
 * of N updates per second — the OS/location provider decides actual delivery.
 * Requires foreground + background permission (owner: location-permissions.ts).
 */
export async function startDriverLocationTask() {
  if (!TaskManager) return;

  const hasStarted = await TaskManager.isTaskRegisteredAsync(DRIVER_LOCATION_TASK);
  if (hasStarted) return;

  await Location.startLocationUpdatesAsync(DRIVER_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 10,
    timeInterval: 10_000,
    foregroundService: {
      notificationTitle: "Drivo driver mode",
      notificationBody: "Sharing your live location with riders",
      notificationColor: "#208AEF",
    },
  });
}

/** Halts the streaming task when the driver goes offline. Idempotent. */
export async function stopDriverLocationTracking() {
  if (!TaskManager) return;

  const hasStarted = await TaskManager.isTaskRegisteredAsync(DRIVER_LOCATION_TASK);
  if (!hasStarted) return;

  await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
}