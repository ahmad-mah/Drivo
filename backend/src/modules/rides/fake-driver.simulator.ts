import { RideStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import * as driverRepository from "../drivers/driver.repository";
import {
  ensureFakeDriversAround,
  getTrackedFakes,
} from "../drivers/fake-drivers.simulator";
import * as rideService from "./ride.service";

const ASSIGN_DELAY_MS = 2_500;
const CHECK_INTERVAL_MS = 1_000;
const NEARBY_RADIUS_KM = 1;

const scheduled = new Set<string>();

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function etaMinutes(distanceKm: number) {
  return Math.max(1, Math.round((distanceKm / 30) * 60));
}

/**
 * Watches PENDING rides and auto-assigns the nearest simulated driver after a
 * short delay so the searching flow can transition to ACCEPTED during testing.
 */
export function startFakeDriverMatchingSimulator() {
  setInterval(async () => {
    try {
      const pendingRides = await prisma.ride.findMany({
        where: { status: RideStatus.PENDING },
        include: { user: { select: { id: true, clerkId: true } } },
      });

      for (const ride of pendingRides) {
        if (scheduled.has(ride.id)) continue;

        const ageMs = Date.now() - ride.createdAt.getTime();
        if (ageMs < ASSIGN_DELAY_MS) continue;

        scheduled.add(ride.id);

        void (async () => {
          try {
            let tracked = getTrackedFakes();
            if (tracked.length === 0) {
              await ensureFakeDriversAround(
                ride.originLatitude,
                ride.originLongitude,
              );
              tracked = getTrackedFakes();
            }

            if (tracked.length === 0) return;

            const nearest = tracked
              .map((fake) => ({
                fake,
                distanceKm: haversineKm(
                  ride.originLatitude,
                  ride.originLongitude,
                  fake.lat,
                  fake.lng,
                ),
              }))
              .filter(({ distanceKm }) => distanceKm <= NEARBY_RADIUS_KM)
              .sort((a, b) => a.distanceKm - b.distanceKm)[0];

            if (!nearest) return;

            const profile = await driverRepository.findById(nearest.fake.id);
            if (!profile) return;

            const distanceKm = nearest.distanceKm;
            const eta = etaMinutes(distanceKm);

            await rideService.assignDriver(ride.user.clerkId, ride.id, {
              id: profile.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              vehicleType: profile.vehicleType,
              vehicleModel: profile.vehicleModel ?? "",
              vehicleColor: profile.vehicleColor ?? "",
              latitude: profile.latitude ?? nearest.fake.lat,
              longitude: profile.longitude ?? nearest.fake.lng,
              heading: profile.heading ?? nearest.fake.heading,
              rating: 4.8,
              fare: Number(ride.fare),
              etaMinutes: eta,
              seats: 4,
              carPlate: profile.vehiclePlate ?? undefined,
              imageUrl: profile.user?.imageUrl ?? undefined,
            });
          } catch (err) {
            scheduled.delete(ride.id);
            console.error("[fake-driver-matching] assignment failed", err);
          }
        })();
      }
    } catch (err) {
      console.error("[fake-driver-matching] sweep failed", err);
    }
  }, CHECK_INTERVAL_MS);
}
