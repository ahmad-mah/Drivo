import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppImage } from "@/shared/components/AppImage";
import { cn } from "@/shared/utils/cn";

export type RideSummary = {
  mapImage: string;
  origin: string;
  destination: string;
  dateTime: string;
  driverName: string;
  carSeats: number;
  paymentStatus: string;
};

export function RideSummaryCard({
  mapImage,
  origin,
  destination,
  dateTime,
  driverName,
  carSeats,
  paymentStatus,
}: RideSummary) {
  const isPaid = paymentStatus.toLowerCase() === "paid";

  return (
    <View style={styles.card}>
      {/* Top section: map + locations */}
      <View style={styles.topSection}>
        {/* Map preview */}
        <View style={styles.mapWrapper}>
          <AppImage
            source={{ uri: mapImage }}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </View>

        {/* Locations */}
        <View style={styles.locations}>
          <View style={styles.locationRow}>
            <View style={styles.originIcon} />
            <Text style={styles.locationText}>{origin}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#6B7280"
              style={styles.destinationIcon}
            />
            <Text style={styles.locationText}>{destination}</Text>
          </View>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.infoContainer}>
        <InfoRow label="Date & Time" value={dateTime} />
        <InfoRow label="Driver" value={driverName} />
        <InfoRow label="Car seats" value={String(carSeats)} />
        <InfoRow
          label="Payment Status"
          value={paymentStatus}
          isPaid={isPaid}
        />
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  isPaid,
}: {
  label: string;
  value: string;
  isPaid?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isPaid && styles.paidValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#101010",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  topSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  mapWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  locations: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  originIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E293B",
    flexShrink: 0,
  },
  destinationIcon: {
    flexShrink: 0,
  },
  locationText: {
    fontFamily: "Jakarta",
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
    flex: 1,
  },
  infoContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  infoLabel: {
    fontFamily: "Jakarta",
    fontSize: 15,
    fontWeight: "400",
    color: "#64748B",
  },
  infoValue: {
    fontFamily: "Jakarta",
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  paidValue: {
    color: "#059669",
  },
});