// Types used by the Users UI.
import type { UserRole } from "@prisma/client";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type UsersActionResult =
  | { ok: true; users: UserListItem[] }
  | { ok: false; error: string };
