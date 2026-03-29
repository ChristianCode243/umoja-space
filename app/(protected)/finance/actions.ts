"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionError } from "@/lib/action-error";
import type { FinanceEntryActionResult } from "./types";

function normalizeText(value: string): string {
  return value.trim();
}

function parseDate(value: string): Date | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  const parsed = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createFinanceEntry(input: {
  type: "INCOME" | "EXPENSE";
  amount: string;
  category: string;
  notes?: string;
  occurredAt: string;
}): Promise<FinanceEntryActionResult> {
  const user = await requireUser();
  if (!["ADMIN", "INFORMATICIEN", "FINANCIER"].includes(user.profile)) {
    return { ok: false, error: "Access denied." };
  }

  const type = input.type;
  const amount = Number(input.amount || 0);
  const category = normalizeText(input.category || "");
  const notes = normalizeText(input.notes || "");
  const occurredAt = parseDate(input.occurredAt || "");

  if (!["INCOME", "EXPENSE"].includes(type) || !Number.isFinite(amount) || amount <= 0 || !category || !occurredAt) {
    return { ok: false, error: "Type, montant, categorie et date sont requis." };
  }

  try {
    const created = await prisma.financeEntry.create({
      data: {
        type,
        amountCents: Math.round(amount * 100),
        category,
        notes: notes || null,
        occurredAt,
        createdById: user.id,
      },
      include: { createdBy: { select: { name: true } } },
    });

    revalidatePath("/finance");
    revalidatePath("/finance/entrees-sorties");

    return {
      ok: true,
      entry: {
        id: created.id,
        type: created.type,
        amountCents: created.amountCents,
        category: created.category,
        notes: created.notes ?? null,
        occurredAt: created.occurredAt.toISOString(),
        createdByName: created.createdBy.name,
      },
    };
  } catch (error) {
    return actionError<FinanceEntryActionResult>(
      "finance.createFinanceEntry",
      error,
      "Impossible d'ajouter ce mouvement de caisse."
    );
  }
}
