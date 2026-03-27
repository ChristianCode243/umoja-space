// Types used by the Ambassadors UI.
export type ClubOption = {
  id: string;
  name: string;
};

export type AmbassadorListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  clubId: string | null;
  clubName: string | null;
  createdAt: string;
};

export type AmbassadorsActionResult =
  | { ok: true; ambassadors: AmbassadorListItem[] }
  | { ok: false; error: string };
