import { prisma } from "@/lib/prisma";
import type { ClubMemberListItem } from "./types";

export async function getClubMembers(clubId?: string): Promise<ClubMemberListItem[]> {
  const members = await prisma.clubMember.findMany({
    where: clubId ? { clubId } : undefined,
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
    status: member.status ?? null,
    joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
    clubId: member.clubId,
    clubName: member.club.name,
    createdAt: member.createdAt.toISOString(),
  }));
}
