export const RideStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  ARRIVED: "ARRIVED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type RideStatus = (typeof RideStatus)[keyof typeof RideStatus];

export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type TicketPriority =
  (typeof TicketPriority)[keyof typeof TicketPriority];

export const PayoutStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
  HELD: "HELD",
} as const;

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

// ── API response wrappers ────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Overview ─────────────────────────────────────────────────────────
export interface AdminOverviewCounts {
  onlineDrivers: number;
  availableDrivers: number;
  searchingRides: number;
  assignedRides: number;
  inProgressRides: number;
  pendingApprovals: number;
}

export interface AdminTodayStats {
  completedRides: number;
  cancelledRides: number;
  revenue: number;
  completionRate: number;
  avgPickupTimeSeconds: number;
  avgTripDurationMinutes: number;
}

export interface AdminOverviewAlert {
  type: "long_wait" | "stuck_trip" | "pending_approval" | "driver_offline";
  count: number;
  severity: "info" | "warning" | "critical";
  rides?: AdminRideSummary[];
}

export interface AdminRideSummary {
  id: string;
  status: RideStatus;
  originAddress: string;
  destinationAddress: string;
  waitTimeSeconds: number;
  nearestDriverCount: number;
  fare: number;
  riderName: string;
  createdAt: string;
}

export interface AdminOverviewResponse {
  counts: AdminOverviewCounts;
  today: AdminTodayStats;
  alerts: AdminOverviewAlert[];
  activeRides: AdminRideMapItem[];
  availableDriversMap: AdminDriverMapItem[];
}

export interface AdminRideMapItem {
  id: string;
  status: RideStatus;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  driver?: { id: string; lat: number; lng: number; heading?: number };
  riderName: string;
}

export interface AdminDriverMapItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  heading?: number;
  vehicleType: string;
  currentRideId?: string;
}

export interface AdminDriverDetail {
  id: string;
  approvalStatus: string;
  isOnline: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  rating: number | null;
  ratingCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    imageUrl: string | null;
    createdAt: string;
  } | null;
  stats: {
    totalTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    completionRate: number;
    totalEarnings: number;
    avgEarningsPerTrip: number;
    onlineMinutes: number;
  };
  recentTrips: {
    id: string;
    status: RideStatus;
    originAddress: string;
    destinationAddress: string;
    fare: number;
    currency: string;
    distanceKm: number;
    createdAt: string;
    completedAt: string | null;
    cancelledAt: string | null;
    riderName: string;
  }[];
}

// ── Trips ────────────────────────────────────────────────────────────
export interface AdminTripListItem {
  id: string;
  status: RideStatus;
  originAddress: string;
  destinationAddress: string;
  distanceKm: number;
  fare: number;
  currency: string;
  riderName: string;
  riderPhone: string;
  driverName: string | null;
  driverPhone: string | null;
  vehicleType: string | null;
  createdAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  nearbyDrivers: number;
}

export interface AdminTripDetail extends AdminTripListItem {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  rideTimeMinutes: number;
  riderRating: number | null;
  riderComment: string | null;
  expiresAt: string;
  rider: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    imageUrl: string | null;
  };
  driver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicleType: string;
    vehicleModel: string;
    vehicleColor: string;
    vehiclePlate: string;
    rating: number | null;
  } | null;
  offers: AdminTripOffer[];
}

export interface AdminTripOffer {
  id: string;
  driverId: string;
  driverName: string;
  vehicleType: string;
  status: string;
  distanceKm: number;
  offeredAt: string;
  respondedAt: string | null;
}

// ── Audit Logs ───────────────────────────────────────────────────────
export interface AdminAuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  previousState: unknown;
  newState: unknown;
  reason: string | null;
  metadata: unknown;
  createdAt: string;
  admin: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}
