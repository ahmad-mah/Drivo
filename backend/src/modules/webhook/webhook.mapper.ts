import type { UserCreatedOrUpdatedEvent } from "./webhook.types";

export function mapClerkUser(event: UserCreatedOrUpdatedEvent) {
  const {
    id,
    first_name,
    last_name,
    image_url,
    email_addresses,
    primary_email_address_id,
  } = event.data;

  const primaryEmail = primary_email_address_id
    ? email_addresses.find((email) => email.id === primary_email_address_id)
    : email_addresses[0];

  return {
    clerkId: id,
    email: primaryEmail?.email_address ?? "",
    firstName: first_name,
    lastName: last_name,
    imageUrl: image_url,
  };
}
