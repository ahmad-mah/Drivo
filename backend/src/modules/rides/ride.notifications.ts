import { getSocketServer } from "../../sockets/ride";

export async function notifyRideRequested(
  clerkId: string,
  rideId: string,
  nearbyDriversCount: number,
) {
  const io = getSocketServer();
  if (!io) return;
  io.to(clerkId).emit("ride:requested", { rideId, nearbyDriversCount });
}

export async function notifyDriverAssigned(
  clerkId: string,
  rideId: string,
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    vehicleType: string;
    vehicleModel: string;
    vehicleColor: string;
    latitude: number;
    longitude: number;
    heading?: number;
    rating?: number;
    fare?: number;
    timeMinutes?: number;
    seats?: number;
    carPlate?: string;
    imageUrl?: string;
  },
) {
  const io = getSocketServer();
  if (!io) return;
  io.to(clerkId).emit("driver:assigned", { rideId, driver });
}
