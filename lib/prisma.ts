// Prisma client singleton to avoid exhausting the database connection in dev.
import { PrismaClient } from "@prisma/client";

// Keep a single instance in the global scope during development.
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
