"use server";

// Server actions for author CRUD.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getAuthors } from "./queries";
import type { AuthorsActionResult } from "./types";

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeWebsite(value: string): string {
  return value.trim();
}

async function requireManagerUser() {
  // Only admins or staff can manage authors.
  const user = await requireUser();
  if (!["ADMIN", "INFORMATICIEN", "LOGISTICIEN", "AUTEUR"].includes(user.profile)) {
    return null;
  }
  return user;
}

export async function createAuthor(input: {
  name: string;
  email?: string;
  website?: string;
  city?: string;
  country?: string;
  bio?: string;
}): Promise<AuthorsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const website = input.website ? normalizeWebsite(input.website) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const bio = input.bio ? normalizeText(input.bio) : "";

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (email) {
    const existing = await prisma.author.findUnique({
      where: { email },
    });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  await prisma.author.create({
    data: {
      name,
      email: email || null,
      website: website || null,
      city: city || null,
      country: country || null,
      bio: bio || null,
    },
  });

  revalidatePath("/auteurs");
  return { ok: true, authors: await getAuthors() };
}

export async function updateAuthor(input: {
  id: string;
  name: string;
  email?: string;
  website?: string;
  city?: string;
  country?: string;
  bio?: string;
}): Promise<AuthorsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const id = input.id;
  const name = normalizeText(input.name || "");
  const email = input.email ? normalizeEmail(input.email) : "";
  const website = input.website ? normalizeWebsite(input.website) : "";
  const city = input.city ? normalizeText(input.city) : "";
  const country = input.country ? normalizeText(input.country) : "";
  const bio = input.bio ? normalizeText(input.bio) : "";

  if (!id || !name) {
    return { ok: false, error: "Id and name are required." };
  }

  if (email && !email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) {
    return { ok: false, error: "Author not found." };
  }

  if (email && author.email !== email) {
    const existing = await prisma.author.findUnique({
      where: { email },
    });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  await prisma.author.update({
    where: { id },
    data: {
      name,
      email: email || null,
      website: website || null,
      city: city || null,
      country: country || null,
      bio: bio || null,
    },
  });

  revalidatePath("/auteurs");
  return { ok: true, authors: await getAuthors() };
}

export async function deleteAuthor(input: {
  id: string;
}): Promise<AuthorsActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "Author id is required." };
  }

  const booksCount = await prisma.book.count({
    where: { authorId: input.id },
  });
  if (booksCount > 0) {
    return {
      ok: false,
      error: "Impossible de supprimer un auteur qui a des livres.",
    };
  }

  await prisma.author.delete({ where: { id: input.id } });

  revalidatePath("/auteurs");
  return { ok: true, authors: await getAuthors() };
}
