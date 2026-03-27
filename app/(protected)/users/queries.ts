// Database queries for the Users page (server-only).
import { prisma } from "@/lib/prisma";
import type { UserListItem } from "./types";

export async function getUsers(): Promise<UserListItem[]> {
  // Fetch users in a consistent order for the UI.
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}
