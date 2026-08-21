export function formatFare(fare: string, fractionDigits = 2): string {
  return parseFloat(fare).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}