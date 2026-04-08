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
  totalContributionsCents: number;
  caisseCents: number;
}> {
  type JournalGroupRow = {
    sourceType: "FINANCE_INCOME" | "FINANCE_EXPENSE" | "CONTRIBUTION" | "ADJUSTMENT";
    side: "DEBIT" | "CREDIT";
    _sum: { amountCents: number | null };
  };

  const journalEntryClient = (prisma as unknown as {
    journalEntry: {
      groupBy: (args: {
        by: Array<"sourceType" | "side">;
        _sum: { amountCents: true };
      }) => Promise<JournalGroupRow[]>;
    };
  }).journalEntry;

  const grouped: JournalGroupRow[] = await journalEntryClient.groupBy({
    by: ["sourceType", "side"],
    _sum: { amountCents: true },
  });

  function netBySource(sourceType: "FINANCE_INCOME" | "FINANCE_EXPENSE" | "CONTRIBUTION"): number {
    const credit =
      grouped.find((row: JournalGroupRow) => row.sourceType === sourceType && row.side === "CREDIT")?._sum
        .amountCents ?? 0;
    const debit =
      grouped.find((row: JournalGroupRow) => row.sourceType === sourceType && row.side === "DEBIT")?._sum
        .amountCents ?? 0;
    return credit - debit;
  }

  const totalIncomeCents = netBySource("FINANCE_INCOME");
  const totalExpenseCents = -netBySource("FINANCE_EXPENSE");
  const totalContributionsCents = netBySource("CONTRIBUTION");
  const credits = grouped
    .filter((row: JournalGroupRow) => row.side === "CREDIT")
    .reduce((sum: number, row: JournalGroupRow) => sum + (row._sum.amountCents ?? 0), 0);
  const debits = grouped
    .filter((row: JournalGroupRow) => row.side === "DEBIT")
    .reduce((sum: number, row: JournalGroupRow) => sum + (row._sum.amountCents ?? 0), 0);

  return {
    totalIncomeCents,
    totalExpenseCents,
    totalContributionsCents,
    caisseCents: credits - debits,
  };
}
