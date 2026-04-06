import { prisma } from "@/lib/prisma";
import type { JournalEntrySide, JournalSourceType } from "@prisma/client";

export async function addJournalEntry(input: {
  side: JournalEntrySide;
  sourceType: JournalSourceType;
  sourceId?: string | null;
  amountCents: number;
  description?: string | null;
  occurredAt?: Date;
  createdById?: string | null;
}) {
  await prisma.journalEntry.create({
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
