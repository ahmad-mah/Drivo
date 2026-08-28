import type { Ride } from "@/features/rides/types/ride.types";

export interface RideSection {
  title: string;
  data: Ride[];
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Buckets rides into human date sections (Today, Yesterday, This week, This
 * month, then "Month Year"). Expects rides already sorted newest-first so the
 * section order follows encounter order.
 */
export function groupRidesByDate(rides: Ride[]): RideSection[] {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = today - 86_400_000;
  const weekAgo = today - 6 * 86_400_000;
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const buckets = new Map<string, Ride[]>();
  const order: string[] = [];

  const bucketFor = (iso: string): string => {
    const t = new Date(iso).getTime();
    if (t >= today) return "Today";
    if (t >= yesterday) return "Yesterday";
    if (t >= weekAgo) return "This week";
    if (t >= thisMonth) return "This month";
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  };

  for (const ride of rides) {
    const key = bucketFor(ride.createdAt);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(ride);
  }

  return order.map((title) => ({ title, data: buckets.get(title)! }));
}
