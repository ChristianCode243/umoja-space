// Types used by the Club Members UI.
export type ClubOption = {
  id: string;
  name: string;
};

export type ClubMemberListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  status: string | null;
  joinedAt: string | null;
  clubId: string;
  clubName: string;
  createdAt: string;
};

export type ClubMembersActionResult =
  | { ok: true; members: ClubMemberListItem[] }
  | { ok: false; error: string };
