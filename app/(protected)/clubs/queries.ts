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

export async function getClubsByScope(clubId?: string): Promise<ClubListItem[]> {
  const clubs = await prisma.club.findMany({
    where: clubId ? { id: clubId } : undefined,
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

export async function getClubOptions(clubId?: string): Promise<ClubOption[]> {
  // Fetch clubs for select lists.
  const clubs = await prisma.club.findMany({
    where: clubId ? { id: clubId } : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return clubs;
}

export type ClubMemberOption = {
  id: string;
  name: string;
  clubId: string;
  clubName: string;
};

export type ClubContributionItem = {
  id: string;
  clubId: string;
  clubName: string;
  memberId: string;
  memberName: string;
  monthKey: string;
  amountCents: number;
  paidAt: string;
  notes: string | null;
};

export async function getClubMemberOptions(clubId?: string): Promise<ClubMemberOption[]> {
  const members = await prisma.clubMember.findMany({
    where: clubId ? { clubId } : undefined,
    include: { club: { select: { name: true } } },
    orderBy: [{ club: { name: "asc" } }, { name: "asc" }],
  });

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    clubId: member.clubId,
    clubName: member.club.name,
  }));
}

export async function getClubContributions(clubId?: string): Promise<ClubContributionItem[]> {
  const rows = await prisma.clubContribution.findMany({
    where: clubId ? { clubId } : undefined,
    include: { member: { select: { name: true } }, club: { select: { name: true } } },
    orderBy: [{ monthKey: "desc" }, { paidAt: "desc" }],
    take: 120,
  });

  return rows.map((row) => ({
    id: row.id,
    clubId: row.clubId,
    clubName: row.club.name,
    memberId: row.memberId,
    memberName: row.member.name,
    monthKey: row.monthKey,
    amountCents: row.amountCents,
    paidAt: row.paidAt.toISOString(),
    notes: row.notes ?? null,
  }));
}
