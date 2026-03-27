// Shared role definitions for user management.
export const USER_ROLES = ["ADMIN", "STAFF", "USER"] as const;
export const USER_PROFILES = [
  "ADMIN",
  "FINANCIER",
  "LOGISTICIEN",
  "CHEF_CLUB",
  "AMBASSADEUR",
  "DESIGNER",
  "INFORMATICIEN",
  "AUTEUR",
] as const;

export type UserRoleOption = (typeof USER_ROLES)[number];
export type UserProfileOption = (typeof USER_PROFILES)[number];
