// Database queries for the Club Members page (server-only).
import { prisma } from "@/lib/prisma";
import type { ClubMemberListItem } from "./types";

export async function getClubMembers(): Promise<ClubMemberListItem[]> {
  // Fetch members with club info for display.
  const members = await prisma.clubMember.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      club: true,
    },
  });

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email ?? null,
    phone: member.phone ?? null,
    city: member.city ?? null,
    role: member.role ?? null,
    joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
    clubId: member.clubId,
    clubName: member.club.name,
    createdAt: member.createdAt.toISOString(),
  }));
}
