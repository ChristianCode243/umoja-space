// Prisma client singleton to avoid exhausting the database connection in dev.
import { PrismaClient } from "@prisma/client";

// Keep a single instance in the global scope during development.

// Map custom Vercel env names to Prisma standard names if needed.
if (!process.env.DATABASE_URL && process.env.umoja_PRISMA_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.umoja_PRISMA_DATABASE_URL;
}

if (!process.env.DIRECT_URL && process.env.umoja_DATABASE_URL) {
  process.env.DIRECT_URL = process.env.umoja_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log only in development to keep production clean.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
