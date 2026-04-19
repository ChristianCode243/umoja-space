import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  usersCount: number;
  booksCount: number;
  clubsCount: number;
  clubMembersCount: number;
  ambassadorsCount: number;
  activeSessionsCount: number;
  financeEntriesCount: number;
  contributionsCount: number;
};

const getCachedDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const now = new Date();
    const [
      usersCount,
      booksCount,
      clubsCount,
      clubMembersCount,
      ambassadorsCount,
      activeSessionsCount,
      financeEntriesCount,
      contributionsCount,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.book.count(),
      prisma.club.count(),
      prisma.clubMember.count(),
      prisma.ambassador.count(),
      prisma.session.count({ where: { expiresAt: { gt: now } } }),
      prisma.financeEntry.count(),
      prisma.clubContribution.count(),
    ]);

    return {
      usersCount,
      booksCount,
      clubsCount,
      clubMembersCount,
      ambassadorsCount,
      activeSessionsCount,
      financeEntriesCount,
      contributionsCount,
    };
  },
  ["dashboard-global-stats"],
  { revalidate: 60 }
);

export async function getDashboardStats(): Promise<DashboardStats> {
  return getCachedDashboardStats();
}
