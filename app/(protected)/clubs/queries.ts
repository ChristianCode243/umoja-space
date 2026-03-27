// Database queries for the Clubs page (server-only).
import { prisma } from "@/lib/prisma";
import type { ClubListItem, ClubOption } from "./types";

export async function getClubs(): Promise<ClubListItem[]> {
  // Fetch clubs with counts for display.
  const clubs = await prisma.club.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          ambassadors: true,
          members: true,
        },
      },
    },
  });

  return clubs.map((club) => ({
    id: club.id,
    name: club.name,
    email: club.email ?? null,
    phone: club.phone ?? null,
    city: club.city ?? null,
    country: club.country ?? null,
    description: club.description ?? null,
    foundedAt: club.foundedAt ? club.foundedAt.toISOString() : null,
    ambassadorsCount: club._count.ambassadors,
    membersCount: club._count.members,
    createdAt: club.createdAt.toISOString(),
  }));
}

export async function getClubOptions(): Promise<ClubOption[]> {
  // Fetch clubs for select lists.
  const clubs = await prisma.club.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return clubs;
}
