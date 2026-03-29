import { prisma } from "@/lib/prisma";
import type { FinanceEntryListItem } from "./types";

export async function getFinanceEntries(): Promise<FinanceEntryListItem[]> {
  const entries = await prisma.financeEntry.findMany({
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { name: true } } },
    take: 120,
  });

  return entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    amountCents: entry.amountCents,
    category: entry.category,
    notes: entry.notes ?? null,
    occurredAt: entry.occurredAt.toISOString(),
    createdByName: entry.createdBy.name,
  }));
}

export async function getFinanceSummary(): Promise<{
  totalIncomeCents: number;
  totalExpenseCents: number;
  caisseCents: number;
}> {
  const grouped = await prisma.financeEntry.groupBy({
    by: ["type"],
    _sum: { amountCents: true },
  });

  const totalIncomeCents = grouped.find((g) => g.type === "INCOME")?._sum.amountCents ?? 0;
  const totalExpenseCents = grouped.find((g) => g.type === "EXPENSE")?._sum.amountCents ?? 0;

  return {
    totalIncomeCents,
    totalExpenseCents,
    caisseCents: totalIncomeCents - totalExpenseCents,
  };
}
