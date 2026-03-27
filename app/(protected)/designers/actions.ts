"use server";

// Server actions for designer CRUD.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getDesigners } from "./queries";
import type { DesignersActionResult } from "./types";

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
  // Only admins or staff can manage designers.
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return null;
  }
  return user;
}

export async function createDesigner(input: {
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  portfolioUrl?: string;
  country?: string;
  bio?: string;
}): Promise<DesignersActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const specialty = input.specialty ? normalizeText(input.specialty) : "";
  const portfolioUrl = input.portfolioUrl ? normalizeText(input.portfolioUrl) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const bio = input.bio ? normalizeText(input.bio) : "";

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (email) {
    const existing = await prisma.designer.findUnique({
      where: { email },
    });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  await prisma.designer.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      specialty: specialty || null,
      portfolioUrl: portfolioUrl || null,
      country: country || null,
      bio: bio || null,
    },
  });

  revalidatePath("/designers");
  return { ok: true, designers: await getDesigners() };
}

export async function updateDesigner(input: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  portfolioUrl?: string;
  country?: string;
  bio?: string;
}): Promise<DesignersActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const id = normalizeText(input.id || "");
  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const specialty = input.specialty ? normalizeText(input.specialty) : "";
  const portfolioUrl = input.portfolioUrl ? normalizeText(input.portfolioUrl) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const bio = input.bio ? normalizeText(input.bio) : "";

  if (!id || !name) {
    return { ok: false, error: "Id and name are required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  const designer = await prisma.designer.findUnique({ where: { id } });
  if (!designer) {
    return { ok: false, error: "Designer not found." };
  }

  if (email && designer.email !== email) {
    const existing = await prisma.designer.findUnique({
      where: { email },
    });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  await prisma.designer.update({
    where: { id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      specialty: specialty || null,
      portfolioUrl: portfolioUrl || null,
      country: country || null,
      bio: bio || null,
    },
  });

  revalidatePath("/designers");
  return { ok: true, designers: await getDesigners() };
}

export async function deleteDesigner(input: {
  id: string;
}): Promise<DesignersActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "Designer id is required." };
  }

  await prisma.designer.delete({ where: { id: input.id } });

  revalidatePath("/designers");
  return { ok: true, designers: await getDesigners() };
}
