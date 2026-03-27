// Database queries for the Ambassadors page (server-only).
import { prisma } from "@/lib/prisma";
import type { AmbassadorListItem } from "./types";

export async function getAmbassadors(): Promise<AmbassadorListItem[]> {
  // Fetch ambassadors with club info for display.
  const ambassadors = await prisma.ambassador.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      club: true,
    },
  });

  return ambassadors.map((ambassador) => ({
    id: ambassador.id,
    name: ambassador.name,
    email: ambassador.email ?? null,
    phone: ambassador.phone ?? null,
    city: ambassador.city ?? null,
    country: ambassador.country ?? null,
    bio: ambassador.bio ?? null,
    clubId: ambassador.clubId ?? null,
    clubName: ambassador.club?.name ?? null,
    createdAt: ambassador.createdAt.toISOString(),
  }));
}
