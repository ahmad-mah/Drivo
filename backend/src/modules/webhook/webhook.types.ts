import type { UserJSON, UserDeletedJSON } from "@clerk/backend";

export type UserCreatedOrUpdatedEvent = {
  type: "user.created" | "user.updated";
  object: "event";
  data: UserJSON;
};

export type UserDeletedEvent = {
  type: "user.deleted";
  object: "event";
  data: UserDeletedJSON;
};

export type UserWebhookEvent = UserCreatedOrUpdatedEvent | UserDeletedEvent;
