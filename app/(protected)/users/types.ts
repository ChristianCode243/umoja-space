// Types used by the Users UI.
import type { UserProfile } from "@prisma/client";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  clubScopeId: string | null;
  clubScopeName: string | null;
  createdAt: string;
};

export type UsersActionResult =
  | { ok: true; users: UserListItem[] }
  | { ok: false; error: string };
