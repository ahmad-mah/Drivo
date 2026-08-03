import type { AdminDriver } from "../types/driver";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDriverName(driver: AdminDriver) {
  return `${driver.firstName} ${driver.lastName}`.trim();
}
