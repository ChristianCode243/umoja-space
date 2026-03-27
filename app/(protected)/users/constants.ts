// Shared role definitions for user management.
export const USER_ROLES = ["ADMIN", "STAFF", "USER"] as const;

export type UserRoleOption = (typeof USER_ROLES)[number];
