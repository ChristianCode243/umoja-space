// Seed script to create the first admin user and default records for local development.
// Change ADMIN_EMAIL and ADMIN_PASSWORD in .env before running.

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

async function main() {
  // Ensure an admin account exists.
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // Hash the admin password before storing it.
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
        passwordHash,
      },
    });

    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin user already exists:", adminEmail);
  }

  // Ensure at least one author exists for book creation.
  const authorCount = await prisma.author.count();
  if (authorCount === 0) {
    await prisma.author.create({
      data: {
        name: "Auteur par defaut",
        bio: "Auteur de demonstration pour demarrer le catalogue.",
      },
    });

    console.log("Default author created.");
  }

  // Ensure at least one designer exists.
  const designerCount = await prisma.designer.count();
  if (designerCount === 0) {
    await prisma.designer.create({
      data: {
        name: "Designer par defaut",
        specialty: "Mise en page",
      },
    });

    console.log("Default designer created.");
  }

  // Ensure at least one club exists for members/ambassadors.
  const clubCount = await prisma.club.count();
  if (clubCount === 0) {
    await prisma.club.create({
      data: {
        name: "Club principal",
        city: "Kinshasa",
        country: "RDC",
        description: "Club de reference pour demarrer la gestion.",
      },
    });

    console.log("Default club created.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
