"use server";

// Server actions for club CRUD.
// Chaque action capture maintenant les erreurs serveur pour une reponse utilisateur stable.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { actionError } from "@/lib/action-error";
import { getClubs } from "./queries";
import type { ClubsActionResult } from "./types";

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
    return { ok: true, clubs: await getClubs() };
  } catch (error) {
    return actionError<ClubsActionResult>("clubs.deleteClub", error, "Impossible de supprimer le club.");
  }
}
