// Database queries for the Books page (server-only).
import { prisma } from "@/lib/prisma";
import type { AuthorOption, BookListItem, DesignerOption } from "./types";

export async function getBooks(): Promise<BookListItem[]> {
  // Fetch books with the author and designer names for display.
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      designer: true,
    },
  });

  return books.map((book) => ({
    id: book.id,
    title: book.title,
    isbn: book.isbn ?? null,
    authorId: book.authorId,
    authorName: book.author.name,
    designerId: book.designerId ?? null,
    designerName: book.designer?.name ?? null,
    description: book.description ?? null,
    publisher: book.publisher ?? null,
    publishedAt: book.publishedAt ? book.publishedAt.toISOString() : null,
    language: book.language ?? null,
    pageCount: book.pageCount ?? null,
    pricePaperCents: book.pricePaperCents,
    priceEbookCents: book.priceEbookCents,
    createdAt: book.createdAt.toISOString(),
  }));
}

export async function getAuthorOptions(): Promise<AuthorOption[]> {
  // Fetch authors for the select list.
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return authors;
}

export async function getDesignerOptions(): Promise<DesignerOption[]> {
  // Fetch designers for the select list.
  const designers = await prisma.designer.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return designers;
}
