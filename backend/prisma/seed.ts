import { PrismaClient, RideStatus } from "@prisma/client";

const prisma = new PrismaClient();

/** Seed only ever links rides to real, existing users — never creates users. */
const SEED_USER_EMAIL_MATCH = "zamalek";

/**
 * The four mock rides that used to live in the mobile home screen, replayed as
 * COMPLETED history. Only fields the ride card renders are carried over.
 */
const SEED_RIDES = [
  {
    originAddress: "Kathmandu, Nepal",
    destinationAddress: "Pokhara, Nepal",
    originLatitude: 27.717245,
    originLongitude: 85.323961,
    destinationLatitude: 28.209583,
    destinationLongitude: 83.985567,
    rideTimeSeconds: 391,
    farePrice: "19500.00",
    driverFirstName: "David",
    driverLastName: "Brown",
    createdAt: new Date("2024-08-12T05:19:20.620Z"),
  },
  {
    originAddress: "Jalkot, MH",
    destinationAddress: "Pune, Maharashtra, India",
    originLatitude: 18.609116,
    originLongitude: 77.165873,
    destinationLatitude: 18.52043,
    destinationLongitude: 73.856744,
    rideTimeSeconds: 491,
    farePrice: "24500.00",
    driverFirstName: "James",
    driverLastName: "Wilson",
    createdAt: new Date("2024-08-12T06:12:17.683Z"),
  },
  {
    originAddress: "Zagreb, Croatia",
    destinationAddress: "Rijeka, Croatia",
    originLatitude: 45.815011,
    originLongitude: 15.981919,
    destinationLatitude: 45.327063,
    destinationLongitude: 14.442176,
    rideTimeSeconds: 124,
    farePrice: "6200.00",
    driverFirstName: "James",
    driverLastName: "Wilson",
    createdAt: new Date("2024-08-12T08:49:01.809Z"),
  },
  {
    originAddress: "Okayama, Japan",
    destinationAddress: "Osaka, Japan",
    originLatitude: 34.655531,
    originLongitude: 133.919795,
    destinationLatitude: 34.693725,
    destinationLongitude: 135.502254,
    rideTimeSeconds: 159,
    farePrice: "7900.00",
    driverFirstName: "Michael",
    driverLastName: "Johnson",
    createdAt: new Date("2024-08-12T18:43:54.297Z"),
  },
];

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: SEED_USER_EMAIL_MATCH } },
  });

  if (!user) {
    console.warn(
      `No user matching "${SEED_USER_EMAIL_MATCH}" found. Sign in once so the ` +
        "Clerk webhook creates the user, then re-run the seed.",
    );
    return;
  }

  const existing = await prisma.ride.count({ where: { userId: user.id } });
  if (existing > 0) {
    console.log(`Skipping: user ${user.email} already has ${existing} ride(s).`);
    return;
  }

  await prisma.ride.createMany({
    data: SEED_RIDES.map((ride) => ({
      userId: user.id,
      status: RideStatus.COMPLETED,
      originAddress: ride.originAddress,
      originLatitude: ride.originLatitude,
      originLongitude: ride.originLongitude,
      destinationAddress: ride.destinationAddress,
      destinationLatitude: ride.destinationLatitude,
      destinationLongitude: ride.destinationLongitude,
      distanceKm: haversineKm(
        ride.originLatitude,
        ride.originLongitude,
        ride.destinationLatitude,
        ride.destinationLongitude,
      ),
      fare: ride.farePrice,
      currency: "USD",
      rideTimeMinutes: Math.round(ride.rideTimeSeconds / 60),
      driverFirstName: ride.driverFirstName,
      driverLastName: ride.driverLastName,
      nearbyDrivers: 0,
      // Completed rides expired long ago; the column is required so reuse the
      // trip date rather than inventing a future deadline.
      expiresAt: ride.createdAt,
      completedAt: ride.createdAt,
      createdAt: ride.createdAt,
    })),
  });

  console.log(`Seeded ${SEED_RIDES.length} completed rides for ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });