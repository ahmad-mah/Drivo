export interface PaymentIntentCreateParams {
  rideId: string;
  userId: string;
  driverId: string;
  grossAmount: number;
  platformFee: number;
  driverShare: number;
  paymentMethodId: string;
  currency?: string;
}

export interface PaymentIntentConfirmParams {
  stripePiId: string;
  paymentMethodId: string;
}

export interface PaymentIntentCaptureParams {
  stripePiId: string;
}

export interface PaymentIntentCancelParams {
  stripePiId: string;
  reason?: string;
}

export interface TransferCreateParams {
  rideId: string;
  stripePiId: string;
  driverId: string;
  driverShare: number;
  currency: string;
}

export interface ConnectOnboardParams {
  driverId: string;
  returnUrl: string;
}

export interface ConnectAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: Record<string, unknown> | null;
  onboardingUrl: string | null;
  currentDeadline: string | null;
  currentRequirements: Record<string, string[]> | null;
  pastRequirements: Record<string, string[]> | null;
  futureRequirements: Record<string, string[]> | null;
}