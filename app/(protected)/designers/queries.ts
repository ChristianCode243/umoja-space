// Database queries for the Designers page (server-only).
import { prisma } from "@/lib/prisma";
import type { DesignerListItem } from "./types";

export async function getDesigners(): Promise<DesignerListItem[]> {
  // Fetch designers in a consistent order.
  const designers = await prisma.designer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return designers.map((designer) => ({
    id: designer.id,
    name: designer.name,
    email: designer.email ?? null,
    phone: designer.phone ?? null,
    specialty: designer.specialty ?? null,
    portfolioUrl: designer.portfolioUrl ?? null,
    country: designer.country ?? null,
    bio: designer.bio ?? null,
    createdAt: designer.createdAt.toISOString(),
  }));
}
