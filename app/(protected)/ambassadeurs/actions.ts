"use server";

// Server actions for ambassador CRUD.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getAmbassadors } from "./queries";
import type { AmbassadorsActionResult } from "./types";

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.trim();
}

async function requireManagerUser() {
  // Only admins or staff can manage ambassadors.
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return null;
  }
  return user;
}

export async function createAmbassador(input: {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  clubId?: string;
  bio?: string;
}): Promise<AmbassadorsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const clubId = input.clubId ? normalizeText(input.clubId) : "";
  const bio = input.bio ? normalizeText(input.bio) : "";

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (email) {
    const existing = await prisma.ambassador.findUnique({
      where: { email },
    });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  if (clubId) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return { ok: false, error: "Club not found." };
    }
  }

  await prisma.ambassador.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      city: city || null,
      country: country || null,
      clubId: clubId || null,
      bio: bio || null,
    },
  });

  revalidatePath("/ambassadeurs");
  return { ok: true, ambassadors: await getAmbassadors() };
}

export async function updateAmbassador(input: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  clubId?: string;
  bio?: string;
}): Promise<AmbassadorsActionResult> {
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
  const clubId = input.clubId ? normalizeText(input.clubId) : "";
  const bio = input.bio ? normalizeText(input.bio) : "";

  if (!id || !name) {
    return { ok: false, error: "Id and name are required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  const ambassador = await prisma.ambassador.findUnique({ where: { id } });
  if (!ambassador) {
    return { ok: false, error: "Ambassador not found." };
  }

  if (email && ambassador.email !== email) {
    const existing = await prisma.ambassador.findUnique({
      where: { email },
    });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  if (clubId) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return { ok: false, error: "Club not found." };
    }
  }

  await prisma.ambassador.update({
    where: { id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      city: city || null,
      country: country || null,
      clubId: clubId || null,
      bio: bio || null,
    },
  });

  revalidatePath("/ambassadeurs");
  return { ok: true, ambassadors: await getAmbassadors() };
}

export async function deleteAmbassador(input: {
  id: string;
}): Promise<AmbassadorsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "Ambassador id is required." };
  }

  await prisma.ambassador.delete({ where: { id: input.id } });

  revalidatePath("/ambassadeurs");
  return { ok: true, ambassadors: await getAmbassadors() };
}
