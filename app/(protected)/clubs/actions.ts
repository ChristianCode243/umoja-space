"use server";

// Server actions for club CRUD.
// Chaque action capture maintenant les erreurs serveur pour une reponse utilisateur stable.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { actionError } from "@/lib/action-error";
import { auditLog } from "@/lib/audit";
import { addJournalEntry } from "@/lib/ledger";
import { getClubs } from "./queries";
import type { ClubContributionActionResult, ClubsActionResult } from "./types";

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.trim();
}

function parseOptionalDate(value: string): Date | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

async function requireManagerUser() {
  // Only admins or staff can manage clubs.
  const user = await requireUser();
  if (!["ADMIN", "INFORMATICIEN", "CHEF_CLUB"].includes(user.profile)) {
    return null;
  }
  return user;
}

function normalizeMonthKey(value: string): string {
  return value.trim();
}

export async function createClub(input: {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  foundedAt?: string;
  description?: string;
}): Promise<ClubsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }
  if (currentUser.profile === "CHEF_CLUB") {
    return { ok: false, error: "Vous ne pouvez pas creer de nouveaux clubs." };
  }

  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const description = input.description ? normalizeText(input.description) : "";
  const foundedAt = input.foundedAt ? parseOptionalDate(input.foundedAt) : null;

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (foundedAt === null && input.foundedAt?.trim()) {
    return { ok: false, error: "Founded date is not valid." };
  }

  if (email) {
    const existing = await prisma.club.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  await prisma.club.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      city: city || null,
      country: country || null,
      description: description || null,
      foundedAt,
    },
  });

  try {
    revalidatePath("/clubs");
    await auditLog({
      actorId: currentUser.id,
      action: "CLUB_CREATE",
      entityType: "Club",
      details: { name },
    });
    return { ok: true, clubs: await getClubs() };
  } catch (error) {
    return actionError<ClubsActionResult>("clubs.createClub", error, "Impossible de creer le club.");
  }
}

export async function updateClub(input: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  foundedAt?: string;
  description?: string;
}): Promise<ClubsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const id = normalizeText(input.id || "");
  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const description = input.description ? normalizeText(input.description) : "";
  const foundedAt = input.foundedAt ? parseOptionalDate(input.foundedAt) : null;

  if (!id || !name) {
    return { ok: false, error: "Id and name are required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (foundedAt === null && input.foundedAt?.trim()) {
    return { ok: false, error: "Founded date is not valid." };
  }

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) {
    return { ok: false, error: "Club not found." };
  }
  if (
    currentUser.profile === "CHEF_CLUB" &&
    currentUser.clubScopeId &&
    currentUser.clubScopeId !== id
  ) {
    return { ok: false, error: "Vous ne pouvez modifier que votre propre club." };
  }

  if (email && club.email !== email) {
    const existing = await prisma.club.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  await prisma.club.update({
    where: { id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      city: city || null,
      country: country || null,
      description: description || null,
      foundedAt,
    },
  });

  try {
    revalidatePath("/clubs");
    await auditLog({
      actorId: currentUser.id,
      action: "CLUB_UPDATE",
      entityType: "Club",
      entityId: id,
      details: { name },
    });
    return { ok: true, clubs: await getClubs() };
  } catch (error) {
    return actionError<ClubsActionResult>("clubs.updateClub", error, "Impossible de mettre a jour le club.");
  }
}

export async function deleteClub(input: {
  id: string;
}): Promise<ClubsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "Club id is required." };
  }
  if (currentUser.profile === "CHEF_CLUB") {
    return { ok: false, error: "Vous ne pouvez pas supprimer un club." };
  }

  const club = await prisma.club.findUnique({
    where: { id: input.id },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  if (!club) {
    return { ok: false, error: "Club not found." };
  }

  if (club._count.members > 0) {
    return {
      ok: false,
      error: "Remove club members before deleting this club.",
    };
  }

  await prisma.club.delete({ where: { id: input.id } });

  try {
    revalidatePath("/clubs");
    await auditLog({
      actorId: currentUser.id,
      action: "CLUB_DELETE",
      entityType: "Club",
      entityId: input.id,
    });
    return { ok: true, clubs: await getClubs() };
  } catch (error) {
    return actionError<ClubsActionResult>("clubs.deleteClub", error, "Impossible de supprimer le club.");
  }
}

export async function createClubContribution(input: {
  memberId: string;
  monthKey: string;
  amount: string;
  notes?: string;
}): Promise<ClubContributionActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const memberId = normalizeText(input.memberId || "");
  const monthKey = normalizeMonthKey(input.monthKey || "");
  const notes = normalizeText(input.notes || "");
  const amount = Number(input.amount || 0);

  if (!memberId || !monthKey || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Membre, mois et montant valides sont requis." };
  }

  const member = await prisma.clubMember.findUnique({
    where: { id: memberId },
    select: { id: true, clubId: true },
  });

  if (!member) {
    return { ok: false, error: "Membre introuvable." };
  }

  if (
    currentUser.profile === "CHEF_CLUB" &&
    currentUser.clubScopeId &&
    currentUser.clubScopeId !== member.clubId
  ) {
    return { ok: false, error: "Vous ne pouvez ajouter des cotisations que pour votre club." };
  }

  try {
    const existing = await prisma.clubContribution.findUnique({
      where: {
        memberId_monthKey: {
          memberId: member.id,
          monthKey,
        },
      },
      select: { amountCents: true },
    });

    await prisma.clubContribution.upsert({
      where: {
        memberId_monthKey: {
          memberId: member.id,
          monthKey,
        },
      },
      update: {
        amountCents: Math.round(amount * 100),
        notes: notes || null,
        paidAt: new Date(),
      },
      create: {
        clubId: member.clubId,
        memberId: member.id,
        monthKey,
        amountCents: Math.round(amount * 100),
        notes: notes || null,
      },
    });

    const nextAmountCents = Math.round(amount * 100);
    const delta = nextAmountCents - (existing?.amountCents ?? 0);
    if (delta !== 0) {
      await addJournalEntry({
        side: delta > 0 ? "CREDIT" : "DEBIT",
        sourceType: "CONTRIBUTION",
        sourceId: `${member.id}:${monthKey}`,
        amountCents: Math.abs(delta),
        description: `Cotisation ${monthKey}`,
        createdById: currentUser.id,
      });
    }

    revalidatePath("/clubs");
    revalidatePath("/finance/cotisations");
    await auditLog({
      actorId: currentUser.id,
      action: "CONTRIBUTION_UPSERT",
      entityType: "ClubContribution",
      entityId: `${member.id}:${monthKey}`,
      details: { amountCents: Math.round(amount * 100) },
    });

    return { ok: true };
  } catch (error) {
    return actionError<ClubContributionActionResult>(
      "clubs.createClubContribution",
      error,
      "Impossible d'enregistrer la cotisation."
    );
  }
}

type ContributionMatrixRow = {
  memberId: string;
  monthKey: string;
  amount: string | number;
  notes?: string;
};

type SaveMatrixInput =
  | {
      monthKey: string;
      rows: Array<{
        memberId: string;
        amount: string | number;
        notes?: string;
      }>;
    }
  | {
      year: number | string;
      amount: string | number;
      selectedByMember: Record<string, boolean | string[] | Record<string, boolean>>;
      notes?: string;
    };

function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function normalizeMatrixRows(input: SaveMatrixInput): ContributionMatrixRow[] {
  if ("rows" in input) {
    return input.rows.map((row) => ({
      memberId: row.memberId,
      monthKey: input.monthKey,
      amount: row.amount,
      notes: row.notes,
    }));
  }

  const year = Number(input.year);
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return [];
  }

  const rows: ContributionMatrixRow[] = [];
  for (const [memberId, selection] of Object.entries(input.selectedByMember)) {
    if (!memberId) {
      continue;
    }

    if (typeof selection === "boolean") {
      if (!selection) {
        continue;
      }
      for (let month = 1; month <= 12; month += 1) {
        rows.push({
          memberId,
          monthKey: toMonthKey(year, month),
          amount: input.amount,
          notes: input.notes,
        });
      }
      continue;
    }

    if (Array.isArray(selection)) {
      for (const selectedMonth of selection) {
        const raw = String(selectedMonth || "").trim();
        if (!raw) {
          continue;
        }

        const monthKey = /^\d{4}-\d{2}$/.test(raw)
          ? raw
          : toMonthKey(year, Number(raw));

        rows.push({
          memberId,
          monthKey,
          amount: input.amount,
          notes: input.notes,
        });
      }
      continue;
    }

    for (const [rawMonth, isSelected] of Object.entries(selection)) {
      if (!isSelected) {
        continue;
      }
      const monthNumber = Number(rawMonth);
      if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        continue;
      }
      rows.push({
        memberId,
        monthKey: toMonthKey(year, monthNumber),
        amount: input.amount,
        notes: input.notes,
      });
    }
  }

  return rows;
}

export async function saveClubContributionsMatrix(
  input: SaveMatrixInput
): Promise<ClubContributionActionResult> {
  const matrixRows = normalizeMatrixRows(input);

  if (matrixRows.length === 0) {
    return { ok: false, error: "Aucune ligne a enregistrer." };
  }

  for (const row of matrixRows) {
    const memberId = normalizeText(row.memberId || "");
    const monthKey = normalizeMonthKey(row.monthKey || "");
    const numericAmount = typeof row.amount === "number" ? row.amount : Number(row.amount || 0);

    if (!memberId || !monthKey || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      continue;
    }

    const result = await createClubContribution({
      memberId,
      monthKey,
      amount: String(numericAmount),
      notes: row.notes ?? "",
    });

    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}
