import type { UserCreatedOrUpdatedEvent } from "./webhook.types";

export function mapClerkUser(event: UserCreatedOrUpdatedEvent) {
  const {
    id,
    first_name,
    last_name,
    image_url,
    email_addresses,
    primary_email_address_id,
    phone_numbers,
    primary_phone_number_id,
  } = event.data;

  const primaryEmail = primary_email_address_id
    ? email_addresses.find((email) => email.id === primary_email_address_id)
    : email_addresses[0];

  const primaryPhone = primary_phone_number_id
    ? phone_numbers.find((phone) => phone.id === primary_phone_number_id)
    : phone_numbers[0];

  return {
    clerkId: id,
    email: primaryEmail?.email_address ?? "",
    firstName: first_name,
    lastName: last_name,
    phone: primaryPhone?.phone_number ?? null,
    imageUrl: image_url,
  };
}
