// Database queries for the Users page (server-only).
import { prisma } from "@/lib/prisma";
import type { UserListItem } from "./types";

export async function getUsers(): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profile: true,
      clubScopeId: true,
      createdAt: true,
      clubScope: {
        select: { name: true },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    clubScopeId: user.clubScopeId,
    clubScopeName: user.clubScope?.name ?? null,
    createdAt: user.createdAt.toISOString(),
  }));
}
