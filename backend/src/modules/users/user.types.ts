export interface CreateUserFromClerkDto {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  imageUrl: string | null;
}
