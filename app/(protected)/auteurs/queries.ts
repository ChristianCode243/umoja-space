// Database queries for the Authors page (server-only).
import { prisma } from "@/lib/prisma";
import type { AuthorListItem } from "./types";

export async function getAuthors(): Promise<AuthorListItem[]> {
  // Fetch authors with a books count for display.
  const authors = await prisma.author.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { books: true },
      },
    },
  });

  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    email: author.email ?? null,
    website: author.website ?? null,
    city: author.city ?? null,
    country: author.country ?? null,
    bio: author.bio ?? null,
    booksCount: author._count.books,
    createdAt: author.createdAt.toISOString(),
  }));
}
