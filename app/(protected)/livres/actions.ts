"use server";

// Server actions for book CRUD.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getBooks } from "./queries";
import type { BooksActionResult } from "./types";

const DEFAULT_PUBLISHER = "Umoja Editions";

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeIsbn(value: string): string {
  return value.replace(/[\s-]/g, "").trim();
}

function parsePriceToCents(value: string): number | null {
  // Accept commas or dots, then convert to integer cents.
  const normalized = value.replace(",", ".").trim();
  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function parseOptionalInt(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const numberValue = Number(normalized);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }

  return Math.floor(numberValue);
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
  // Only admins or staff can manage books.
  const user = await requireUser();
  if (!["ADMIN", "INFORMATICIEN", "LOGISTICIEN"].includes(user.profile)) {
    return null;
  }
  return user;
}

export async function createBook(input: {
  title: string;
  isbn: string;
  authorId: string;
  designerId?: string;
  pricePaper: string;
  priceEbook: string;
  publishedAt?: string;
  language?: string;
  pageCount?: string;
  description?: string;
}): Promise<BooksActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const title = normalizeText(input.title || "");
  const isbnNormalized = normalizeIsbn(input.isbn || "");
  const isbn = isbnNormalized ? isbnNormalized : null;
  const authorId = normalizeText(input.authorId || "");
  const designerId = input.designerId ? normalizeText(input.designerId) : "";
  const pricePaperCents = parsePriceToCents(input.pricePaper || "");
  const priceEbookCents = parsePriceToCents(input.priceEbook || "");
  const language = input.language ? normalizeText(input.language) : "";
  const description = input.description ? normalizeText(input.description) : "";
  const pageCount = input.pageCount ? parseOptionalInt(input.pageCount) : null;
  const publishedAt = input.publishedAt
    ? parseOptionalDate(input.publishedAt)
    : null;

  if (!title || !authorId) {
    return { ok: false, error: "Title and author are required." };
  }

  if (isbn && isbn.length < 10) {
    return { ok: false, error: "ISBN is not valid." };
  }

  if (pricePaperCents === null || priceEbookCents === null) {
    return { ok: false, error: "Prices must be valid numbers." };
  }

  if (pageCount === null && input.pageCount?.trim()) {
    return { ok: false, error: "Page count must be a positive number." };
  }

  if (publishedAt === null && input.publishedAt?.trim()) {
    return { ok: false, error: "Publication date is not valid." };
  }

  const author = await prisma.author.findUnique({
    where: { id: authorId },
  });
  if (!author) {
    return { ok: false, error: "Author not found." };
  }

  if (designerId) {
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
    });
    if (!designer) {
      return { ok: false, error: "Designer not found." };
    }
  }

  if (isbn) {
    const existing = await prisma.book.findUnique({ where: { isbn } });
    if (existing) {
      return { ok: false, error: "ISBN is already in use." };
    }
  }

  await prisma.book.create({
    data: {
      title,
      isbn,
      authorId,
      designerId: designerId || null,
      pricePaperCents,
      priceEbookCents,
      publisher: DEFAULT_PUBLISHER,
      language: language || null,
      description: description || null,
      pageCount,
      publishedAt,
    },
  });

  revalidatePath("/livres");
  return { ok: true, books: await getBooks() };
}

export async function updateBook(input: {
  id: string;
  title: string;
  isbn: string;
  authorId: string;
  designerId?: string;
  pricePaper: string;
  priceEbook: string;
  publishedAt?: string;
  language?: string;
  pageCount?: string;
  description?: string;
}): Promise<BooksActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const id = normalizeText(input.id || "");
  const title = normalizeText(input.title || "");
  const isbnNormalized = normalizeIsbn(input.isbn || "");
  const isbn = isbnNormalized ? isbnNormalized : null;
  const authorId = normalizeText(input.authorId || "");
  const designerId = input.designerId ? normalizeText(input.designerId) : "";
  const pricePaperCents = parsePriceToCents(input.pricePaper || "");
  const priceEbookCents = parsePriceToCents(input.priceEbook || "");
  const language = input.language ? normalizeText(input.language) : "";
  const description = input.description ? normalizeText(input.description) : "";
  const pageCount = input.pageCount ? parseOptionalInt(input.pageCount) : null;
  const publishedAt = input.publishedAt
    ? parseOptionalDate(input.publishedAt)
    : null;

  if (!id || !title || !authorId) {
    return { ok: false, error: "Id, title and author are required." };
  }

  if (isbn && isbn.length < 10) {
    return { ok: false, error: "ISBN is not valid." };
  }

  if (pricePaperCents === null || priceEbookCents === null) {
    return { ok: false, error: "Prices must be valid numbers." };
  }

  if (pageCount === null && input.pageCount?.trim()) {
    return { ok: false, error: "Page count must be a positive number." };
  }

  if (publishedAt === null && input.publishedAt?.trim()) {
    return { ok: false, error: "Publication date is not valid." };
  }

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    return { ok: false, error: "Book not found." };
  }

  if (isbn && book.isbn !== isbn) {
    const existing = await prisma.book.findUnique({ where: { isbn } });
    if (existing) {
      return { ok: false, error: "ISBN is already in use." };
    }
  }

  const author = await prisma.author.findUnique({
    where: { id: authorId },
  });
  if (!author) {
    return { ok: false, error: "Author not found." };
  }

  if (designerId) {
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
    });
    if (!designer) {
      return { ok: false, error: "Designer not found." };
    }
  }

  await prisma.book.update({
    where: { id },
    data: {
      title,
      isbn,
      authorId,
      designerId: designerId || null,
      pricePaperCents,
      priceEbookCents,
      publisher: book.publisher ?? DEFAULT_PUBLISHER,
      language: language || null,
      description: description || null,
      pageCount,
      publishedAt,
    },
  });

  revalidatePath("/livres");
  return { ok: true, books: await getBooks() };
}

export async function deleteBook(input: {
  id: string;
}): Promise<BooksActionResult> {
  const currentUser = await requireManagerUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "Book id is required." };
  }

  await prisma.book.delete({ where: { id: input.id } });

  revalidatePath("/livres");
  return { ok: true, books: await getBooks() };
}
