import { prisma } from "@/lib/prisma";

type JournalEntrySide = "DEBIT" | "CREDIT";
type JournalSourceType = "FINANCE_INCOME" | "FINANCE_EXPENSE" | "CONTRIBUTION" | "ADJUSTMENT";
type JournalCreateData = {
  side: JournalEntrySide;
  sourceType: JournalSourceType;
  sourceId: string | null;
  amountCents: number;
  description: string | null;
  occurredAt: Date;
  createdById: string | null;
};

export async function addJournalEntry(input: {
  side: JournalEntrySide;
  sourceType: JournalSourceType;
  sourceId?: string | null;
  amountCents: number;
  description?: string | null;
  occurredAt?: Date;
  createdById?: string | null;
}) {
  const journalEntryClient = (prisma as unknown as {
    journalEntry: { create: (args: { data: JournalCreateData }) => Promise<unknown> };
  }).journalEntry;

  await journalEntryClient.create({
    data: {
      side: input.side,
      sourceType: input.sourceType,
      sourceId: input.sourceId ?? null,
      amountCents: input.amountCents,
      description: input.description ?? null,
      occurredAt: input.occurredAt ?? new Date(),
      createdById: input.createdById ?? null,
    },
  });
}
