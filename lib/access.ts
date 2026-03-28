import type { User, UserProfile } from "@prisma/client";

export type AppSection = "dashboard" | "logistique" | "finance" | "clubs" | "departement";

const fullAccessProfiles: UserProfile[] = ["ADMIN", "INFORMATICIEN"];

const sectionProfiles: Record<AppSection, UserProfile[]> = {
  dashboard: [
    "ADMIN",
    "FINANCIER",
    "LOGISTICIEN",
    "CHEF_CLUB",
    "AMBASSADEUR",
    "DESIGNER",
    "INFORMATICIEN",
    "AUTEUR",
  ],
  logistique: ["ADMIN", "LOGISTICIEN", "INFORMATICIEN"],
  finance: ["ADMIN", "FINANCIER", "INFORMATICIEN"],
  clubs: ["ADMIN", "CHEF_CLUB", "AMBASSADEUR", "INFORMATICIEN"],
  departement: ["ADMIN", "INFORMATICIEN"],
};

export function hasFullAccess(user: Pick<User, "profile">): boolean {
  return fullAccessProfiles.includes(user.profile);
}

export function canAccessSection(
  user: Pick<User, "profile">,
  section: AppSection
): boolean {
  if (hasFullAccess(user)) {
    return true;
  }

  return sectionProfiles[section].includes(user.profile);
}

export function getVisibleSections(user: Pick<User, "profile">): AppSection[] {
  const sections: AppSection[] = [
    "dashboard",
    "logistique",
    "finance",
    "clubs",
    "departement",
  ];

  return sections.filter((section) => canAccessSection(user, section));
}

export function isClubScopedProfile(user: Pick<User, "profile">): boolean {
  return user.profile === "CHEF_CLUB" || user.profile === "AMBASSADEUR";
}
