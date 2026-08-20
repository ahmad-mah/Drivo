import { prisma } from "../../config/database";
import { broadcastNearbyDriversToAll } from "../../sockets";

// Pool size mirrors the rider client's MAX_NEARBY_DRIVERS cap: a full fleet is
// exactly what one map can show, never more.
const MAX_DRIVERS = 4;
const UPDATE_INTERVAL_MS = 10_000;
const SPREAD_KM = 0.7;
const FAKE_CLERK_PREFIX = "fake-clerk-";

const NAMES = [
  { firstName: "Ahmed", lastName: "Hassan" },
  { firstName: "Mohamed", lastName: "Ali" },
  { firstName: "Omar", lastName: "Khaled" },
  { firstName: "Youssef", lastName: "Ibrahim" },
  { firstName: "Karim", lastName: "Mahmoud" },
  { firstName: "Tariq", lastName: "Said" },
  { firstName: "Hassan", lastName: "Nabil" },
  { firstName: "Ali", lastName: "Fathy" },
  { firstName: "Ibrahim", lastName: "Reda" },
  { firstName: "Khaled", lastName: "Omar" },
  { firstName: "Samir", lastName: "Adel" },
  { firstName: "Nour", lastName: "Said" },
  { firstName: "Ramy", lastName: "Gamal" },
  { firstName: "Fadi", lastName: "Mounir" },
  { firstName: "Hany", lastName: "Tawfik" },
];

const VEHICLES = [
  { type: "Economy", model: "Toyota Corolla", color: "White", plate: "CAI 1001" },
  { type: "Comfort", model: "Hyundai Elantra", color: "Black", plate: "CAI 1002" },
  { type: "Premier", model: "BMW 5 Series", color: "Silver", plate: "CAI 1003" },
  { type: "Electric", model: "Tesla Model 3", color: "Red", plate: "CAI 1004" },
  { type: "Economy", model: "Nissan Sunny", color: "Blue", plate: "CAI 1005" },
  { type: "Comfort", model: "Honda Accord", color: "Grey", plate: "CAI 1006" },
  { type: "Premier", model: "Mercedes E-Class", color: "Black", plate: "CAI 1007" },
  { type: "Electric", model: "BYD Seal", color: "White", plate: "CAI 1008" },
  { type: "Economy", model: "Kia Rio", color: "Green", plate: "CAI 1009" },
  { type: "Comfort", model: "VW Jetta", color: "Brown", plate: "CAI 1010" },
];

// Real portrait photos (randomuser.me CDN) so the simulated fleet looks
// believable on the rider map; indexed in lockstep with NAMES.
const AVATARS = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/men/41.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/men/64.jpg",
  "https://randomuser.me/api/portraits/men/18.jpg",
  "https://randomuser.me/api/portraits/men/56.jpg",
  "https://randomuser.me/api/portraits/men/85.jpg",
];

const DEG_PER_KM = 1 / 111;

interface TrackedFake {
  id: string;
  clerkId: string;
  lat: number;
  lng: number;
  heading: number;
  speedLat: number;
  speedLng: number;
}

// Keyed by clerkId so re-spawning an existing fake updates its mover instead
// of appending a second one for the same row.
const trackedFakes = new Map<string, TrackedFake>();
let baseLatitude = 0;
let baseLongitude = 0;

// Lazily-run one-shot init shared by both entry points: every process start
// begins the simulation from a clean slate, so ghosts left online by a
// previous run can never pile up.
let readyPromise: Promise<void> | null = null;

function ready(): Promise<void> {
  readyPromise ??= (async () => {
    const result = await prisma.driverProfile.updateMany({
      where: {
        isOnline: true,
        user: { clerkId: { startsWith: FAKE_CLERK_PREFIX } },
      },
      data: { isOnline: false },
    });
    if (result.count > 0) {
      broadcastNearbyDriversToAll();
    }
  })();
  return readyPromise;
}

function randomOffset(rangeKm: number) {
  return (Math.random() - 0.5) * 2 * rangeKm * DEG_PER_KM;
}

function fakeClerkId(index: number) {
  return `${FAKE_CLERK_PREFIX}${index + 1}`;
}

function firstFreeSlot(): number {
  for (let i = 0; i < MAX_DRIVERS; i++) {
    if (!trackedFakes.has(fakeClerkId(i))) return i;
  }
  return MAX_DRIVERS;
}

async function spawnFake(index: number): Promise<TrackedFake> {
  const name = NAMES[index % NAMES.length];
  const vehicle = VEHICLES[index % VEHICLES.length];
  const clerkId = fakeClerkId(index);
  const lat = baseLatitude + randomOffset(SPREAD_KM);
  const lng = baseLongitude + randomOffset(SPREAD_KM);
  const heading = Math.floor(Math.random() * 360);

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email: `fake-driver-${index + 1}@test.local`,
      firstName: name.firstName,
      lastName: name.lastName,
      role: "USER",
      imageUrl: AVATARS[index % AVATARS.length],
    },
    update: {
      firstName: name.firstName,
      lastName: name.lastName,
      imageUrl: AVATARS[index % AVATARS.length],
    },
  });

  const profile = await prisma.driverProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      firstName: name.firstName,
      lastName: name.lastName,
      phone: `0100000000${index + 1}`,
      vehicleType: vehicle.type,
      vehicleModel: vehicle.model,
      vehicleColor: vehicle.color,
      vehiclePlate: vehicle.plate,
      licenseNumber: `LIC-${1000 + index}`,
      approvalStatus: "APPROVED",
      isOnline: true,
      latitude: lat,
      longitude: lng,
      heading,
      lastSeenAt: new Date(),
    },
    update: {
      isOnline: true,
      latitude: lat,
      longitude: lng,
      heading,
      lastSeenAt: new Date(),
    },
  });

  return {
    id: profile.id,
    clerkId,
    lat,
    lng,
    heading,
    speedLat: randomOffset(0.15),
    speedLng: randomOffset(0.15),
  };
}

/**
 * Tops the simulated fleet back up to MAX_DRIVERS around the requester's area.
 * The budget counts ONLY simulated drivers — real driver emulators must never
 * create spawn deficits (that ratchet was what kept crowding the map).
 */
export async function ensureFakeDriversAround(lat: number, lng: number) {
  await ready();

  baseLatitude = lat;
  baseLongitude = lng;
  if (trackedFakes.size >= MAX_DRIVERS) return;

  while (trackedFakes.size < MAX_DRIVERS) {
    const fake = await spawnFake(firstFreeSlot());
    trackedFakes.set(fake.clerkId, fake);
  }

  broadcastNearbyDriversToAll();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Current in-memory fake fleet — used by the ride matcher to pick a driver. */
export function getTrackedFakes(): ReadonlyArray<TrackedFake> {
  return Array.from(trackedFakes.values());
}

export function startFakeDriversSimulator() {
  void ready().finally(() => {
    setInterval(async () => {
      if (trackedFakes.size === 0) return;

      for (const fake of trackedFakes.values()) {
        fake.lat += fake.speedLat;
        fake.lng += fake.speedLng;
        fake.heading = (fake.heading + (Math.random() - 0.5) * 40 + 360) % 360;

        if (Math.abs(fake.lat - baseLatitude) > SPREAD_KM * DEG_PER_KM) {
          fake.speedLat *= -1;
          fake.lat = clamp(
            fake.lat,
            baseLatitude - SPREAD_KM * DEG_PER_KM,
            baseLatitude + SPREAD_KM * DEG_PER_KM,
          );
        }
        if (Math.abs(fake.lng - baseLongitude) > SPREAD_KM * DEG_PER_KM) {
          fake.speedLng *= -1;
          fake.lng = clamp(
            fake.lng,
            baseLongitude - SPREAD_KM * DEG_PER_KM,
            baseLongitude + SPREAD_KM * DEG_PER_KM,
          );
        }

        await prisma.driverProfile.update({
          where: { id: fake.id },
          data: {
            latitude: fake.lat,
            longitude: fake.lng,
            heading: Math.round(fake.heading),
            lastSeenAt: new Date(),
          },
        });
      }

      broadcastNearbyDriversToAll();
    }, UPDATE_INTERVAL_MS);
  });
}
