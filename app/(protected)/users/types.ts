// Types used by the Users UI.
import type { UserProfile, UserRole } from "@prisma/client";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  clubScopeId: string | null;
  clubScopeName: string | null;
  createdAt: string;
};

export type UsersActionResult =
  | { ok: true; users: UserListItem[] }
  | { ok: false; error: string };
