import { useState } from "react";
import { Text, View } from "react-native";
import { AppButton, AppDialog, AppTextInput } from "@/shared/components";
import { StarRatingInput } from "@/features/rides/components/StarRatingInput";
import type { Ride } from "@/features/rides/types/ride.types";

interface RatingSheetProps {
  ride: Ride | null;
  submitting: boolean;
  onSubmit: (rideId: string, stars: number, comment?: string) => void;
  onClose: () => void;
}

/**
 * Modal for rating a completed trip from the home history list. Stars are
 * required; the written comment is optional. Submission is final.
 */
export function RatingSheet({
  ride,
  submitting,
  onSubmit,
  onClose,
}: RatingSheetProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  return (
    <AppDialog visible={ride != null} onClose={onClose}>
      <Text className="text-center font-Jakarta-Bold text-lg text-secondary-900">
        Rate your driver
      </Text>
      <View className="mt-4 items-center">
        <StarRatingInput value={stars} onChange={setStars} disabled={submitting} />
      </View>
      <AppTextInput
        placeholder="Add a comment (optional)"
        value={comment}
        onChangeText={setComment}
        maxLength={300}
      />
      <View className="mt-5 w-full gap-2">
        <AppButton
          title="Submit"
          disabled={stars == null || submitting}
          loading={submitting}
          onPress={() => ride && stars != null && onSubmit(ride.id, stars, comment || undefined)}
        />
        <AppButton title="Skip" variant="outline" onPress={onClose} disabled={submitting} />
      </View>
    </AppDialog>
  );
}
