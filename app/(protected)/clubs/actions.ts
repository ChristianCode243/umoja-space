"use server";

// Server actions for club CRUD.
// Chaque action capture maintenant les erreurs serveur pour une reponse utilisateur stable.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { actionError } from "@/lib/action-error";
import { auditLog } from "@/lib/audit";
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

function buildMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
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

export async function saveClubContributionsMatrix(input: {
  year: number;
  amount: string;
  selectedByMember: Record<string, string[]>;
}): Promise<ClubContributionActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser || currentUser.profile === "AMBASSADEUR") {
    return { ok: false, error: "Access denied." };
  }

  const amount = Number(input.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Montant mensuel invalide." };
  }

  const year = Number(input.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { ok: false, error: "Annee invalide." };
  }

  const memberIds = Object.keys(input.selectedByMember ?? {});
  if (memberIds.length === 0) {
    return { ok: true };
  }

  const members = await prisma.clubMember.findMany({
    where: {
      id: { in: memberIds },
      ...(currentUser.clubScopeId ? { clubId: currentUser.clubScopeId } : {}),
    },
    select: { id: true, clubId: true },
  });

  const allowedMembers = new Map(members.map((member) => [member.id, member]));
  const months = Array.from({ length: 12 }, (_, index) => buildMonthKey(year, index + 1));
  const amountCents = Math.round(amount * 100);

  try {
    await prisma.$transaction(async (tx) => {
      for (const memberId of memberIds) {
        const member = allowedMembers.get(memberId);
        if (!member) {
          continue;
        }

        const selectedSet = new Set(
          (input.selectedByMember[memberId] ?? []).filter((monthKey) => months.includes(monthKey))
        );
        const existing = await tx.clubContribution.findMany({
          where: {
            memberId,
            monthKey: { in: months },
          },
          select: { id: true, monthKey: true },
        });

        const existingSet = new Set(existing.map((row) => row.monthKey));

        for (const monthKey of months) {
          const shouldExist = selectedSet.has(monthKey);
          const exists = existingSet.has(monthKey);

          if (shouldExist && !exists) {
            await tx.clubContribution.create({
              data: {
                clubId: member.clubId,
                memberId,
                monthKey,
                amountCents,
              },
            });
          }

          if (!shouldExist && exists) {
            await tx.clubContribution.deleteMany({
              where: { memberId, monthKey },
            });
          }
        }
      }
    });

    revalidatePath("/clubs");
    revalidatePath("/finance");
    revalidatePath("/finance/cotisations");
    await auditLog({
      actorId: currentUser.id,
      action: "CONTRIBUTION_MATRIX_SAVE",
      entityType: "ClubContribution",
      details: { year, memberCount: memberIds.length },
    });

    return { ok: true };
  } catch (error) {
    return actionError<ClubContributionActionResult>(
      "clubs.saveClubContributionsMatrix",
      error,
      "Impossible d'enregistrer les cotisations."
    );
  }
}
