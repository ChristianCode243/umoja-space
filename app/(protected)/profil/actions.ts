"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
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

export type PasswordActionResult =
  | {
      ok: true;
      message: string;
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
}): Promise<ProfileActionResult> {
  const currentUser = await requireUser();
  const name = normalizeText(input.name || "");
  const email = normalizeEmail(input.email || "");

  if (!name || !email) {
    return { ok: false, error: "Le nom et l'email sont requis." };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "L'email est invalide." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing && existing.id !== currentUser.id) {
      return { ok: false, error: "Cet email est deja utilise." };
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
      },
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

export async function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<PasswordActionResult> {
  const currentUser = await requireUser();
  const currentPassword = normalizeText(input.currentPassword || "");
  const newPassword = normalizeText(input.newPassword || "");
  const confirmPassword = normalizeText(input.confirmPassword || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: "Tous les champs sont requis." };
  }

  if (newPassword.length < 8) {
    return { ok: false, error: "Le nouveau mot de passe doit contenir au moins 8 caracteres." };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "La confirmation du mot de passe ne correspond pas." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return { ok: false, error: "Utilisateur introuvable." };
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return { ok: false, error: "Votre ancien mot de passe est incorrect." };
    }

    const nextPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        passwordHash: nextPasswordHash,
      },
    });

    await auditLog({
      actorId: currentUser.id,
      action: "PROFILE_PASSWORD_CHANGE",
      entityType: "User",
      entityId: currentUser.id,
      details: {
        changedByUser: true,
      },
    });

    revalidatePath("/profil");

    return {
      ok: true,
      message: "Mot de passe mis a jour avec succes.",
    };
  } catch (error) {
    return actionError<PasswordActionResult>(
      "profil.changeMyPassword",
      error,
      "Impossible de changer le mot de passe pour le moment."
    );
  }
}
