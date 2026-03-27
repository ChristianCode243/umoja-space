"use server";

// Server actions for club members CRUD.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getClubMembers } from "./queries";
import type { ClubMembersActionResult } from "./types";

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
  // Only admins or staff can manage club members.
  const user = await requireUser();
  if (!["ADMIN", "INFORMATICIEN", "CHEF_CLUB", "AMBASSADEUR"].includes(user.profile)) {
    return null;
  }
  return user;
}

export async function createClubMember(input: {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  joinedAt?: string;
  clubId: string;
}): Promise<ClubMembersActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const role = input.role ? normalizeText(input.role) : "";
  const clubId = normalizeText(input.clubId || "");
  const joinedAt = input.joinedAt ? parseOptionalDate(input.joinedAt) : null;

  if (!name || !clubId) {
    return { ok: false, error: "Name and club are required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (joinedAt === null && input.joinedAt?.trim()) {
    return { ok: false, error: "Joined date is not valid." };
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) {
    return { ok: false, error: "Club not found." };
  }


  if (currentUser.profile === "AMBASSADEUR" && currentUser.clubScopeId && currentUser.clubScopeId !== clubId) {
    return { ok: false, error: "Vous ne pouvez ajouter des membres que dans votre club." };
  }
  await prisma.clubMember.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      city: city || null,
      role: role || null,
      joinedAt,
      clubId,
    },
  });

  revalidatePath("/membres-clubs");
  const scopedClubId = currentUser.clubScopeId ?? undefined;
  return { ok: true, members: await getClubMembers(scopedClubId) };
}

export async function updateClubMember(input: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  joinedAt?: string;
  clubId: string;
}): Promise<ClubMembersActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser || currentUser.profile === "AMBASSADEUR") {
    return { ok: false, error: "Access denied." };
  }

  const id = normalizeText(input.id || "");
  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const role = input.role ? normalizeText(input.role) : "";
  const clubId = normalizeText(input.clubId || "");
  const joinedAt = input.joinedAt ? parseOptionalDate(input.joinedAt) : null;

  if (!id || !name || !clubId) {
    return { ok: false, error: "Id, name and club are required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (joinedAt === null && input.joinedAt?.trim()) {
    return { ok: false, error: "Joined date is not valid." };
  }

  const member = await prisma.clubMember.findUnique({ where: { id } });
  if (!member) {
    return { ok: false, error: "Member not found." };
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) {
    return { ok: false, error: "Club not found." };
  }

  await prisma.clubMember.update({
    where: { id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      city: city || null,
      role: role || null,
      joinedAt,
      clubId,
    },
  });

  revalidatePath("/membres-clubs");
  const scopedClubId = currentUser.clubScopeId ?? undefined;
  return { ok: true, members: await getClubMembers(scopedClubId) };
}

export async function deleteClubMember(input: {
  id: string;
}): Promise<ClubMembersActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser || currentUser.profile === "AMBASSADEUR") {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "Member id is required." };
  }

  await prisma.clubMember.delete({ where: { id: input.id } });

  revalidatePath("/membres-clubs");
  const scopedClubId = currentUser.clubScopeId ?? undefined;
  return { ok: true, members: await getClubMembers(scopedClubId) };
}
