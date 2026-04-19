"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { auditLog } from "@/lib/audit";
import { actionError } from "@/lib/action-error";

export type ProfileActionResult =
  | {
      ok: true;
      user: {
        name: string;
        email: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function updateMyProfile(input: {
  name: string;
  email: string;
  newPassword?: string;
}): Promise<ProfileActionResult> {
  const currentUser = await requireUser();
  const name = normalizeText(input.name || "");
  const email = normalizeEmail(input.email || "");
  const newPassword = normalizeText(input.newPassword || "");

  if (!name || !email) {
    return { ok: false, error: "Le nom et l'email sont requis." };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "L'email est invalide." };
  }

  if (newPassword && newPassword.length < 8) {
    return { ok: false, error: "Le mot de passe doit contenir au moins 8 caracteres." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing && existing.id !== currentUser.id) {
      return { ok: false, error: "Cet email est deja utilise." };
    }

    const data: {
      name: string;
      email: string;
      passwordHash?: string;
    } = {
      name,
      email,
    };

    if (newPassword) {
      data.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    await auditLog({
      actorId: currentUser.id,
      action: "PROFILE_UPDATE",
      entityType: "User",
      entityId: updated.id,
      details: {
        updatedFields: {
          nameChanged: currentUser.name !== name,
          emailChanged: currentUser.email !== email,
          passwordChanged: Boolean(newPassword),
        },
      },
    });

    revalidatePath("/profil");
    revalidatePath("/dashboard");

    return {
      ok: true,
      user: {
        name: updated.name,
        email: updated.email,
      },
    };
  } catch (error) {
    return actionError<ProfileActionResult>(
      "profil.updateMyProfile",
      error,
      "Impossible de mettre a jour votre profil pour le moment."
    );
  }
}
