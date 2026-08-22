type DriverModeStatus = {
  title: string;
  description: string;
};

const COPY = {
  offline: {
    title: "You're offline",
    description:
      "We lost your connection. You'll be back online automatically when it returns.",
  },
  online: {
    title: "Accepting new rides",
    description: "Riders can see your live location",
  },
  idle: {
    title: "Driver mode",
    description: "Go online to start receiving rides",
  },
} as const;

export function driverModeStatusCopy(
  autoOffline: boolean,
  isOnline: boolean,
): DriverModeStatus {
  if (autoOffline) return COPY.offline;
  return isOnline ? COPY.online : COPY.idle;
}