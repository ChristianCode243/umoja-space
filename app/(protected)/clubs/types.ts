// Types used by the Clubs UI.
export type ClubOption = {
  id: string;
  name: string;
};

export type ClubListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  foundedAt: string | null;
  ambassadorsCount: number;
  membersCount: number;
  createdAt: string;
};

export type ClubsActionResult =
  | { ok: true; clubs: ClubListItem[] }
  | { ok: false; error: string };

export type ClubContributionActionResult =
  | { ok: true }
  | { ok: false; error: string };
