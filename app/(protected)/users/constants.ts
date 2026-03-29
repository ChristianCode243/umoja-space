// Shared profile definitions for user management.
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

export type UserProfileOption = (typeof USER_PROFILES)[number];
