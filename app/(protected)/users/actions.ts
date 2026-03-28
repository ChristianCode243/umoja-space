"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireUser } from "@/lib/auth";
import { getUsers } from "./queries";
import {
  USER_PROFILES,
  USER_ROLES,
  type UserProfileOption,
  type UserRoleOption,
} from "./constants";
import type { UsersActionResult } from "./types";

function isValidRole(role: string): role is UserRoleOption {
  return USER_ROLES.includes(role as UserRoleOption);
}

function isValidProfile(profile: string): profile is UserProfileOption {
  return USER_PROFILES.includes(profile as UserProfileOption);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function requireDepartmentManager() {
  const user = await requireUser();
  if (!["ADMIN", "INFORMATICIEN"].includes(user.profile)) {
    return null;
  }
  return user;
}

async function ensureClubScope(
  clubScopeId: string,
  profile: UserProfileOption
): Promise<string | null> {
  if (profile !== "CHEF_CLUB" && profile !== "AMBASSADEUR") {
    return null;
  }

  if (!clubScopeId) {
    throw new Error("Un club doit etre selectionne pour ce profil.");
  }

  const club = await prisma.club.findUnique({ where: { id: clubScopeId } });
  if (!club) {
    throw new Error("Le club selectionne est introuvable.");
  }

  return clubScopeId;
}

export async function createUser(input: {
  name: string;
  email: string;
  role: string;
  profile: string;
  clubScopeId?: string;
  password: string;
}): Promise<UsersActionResult> {
  const currentUser = await requireDepartmentManager();
  if (!currentUser) return { ok: false, error: "Access denied." };

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!name || !email || !password) {
    return { ok: false, error: "Name, email, and password are required." };
  }

  if (!isValidRole(input.role) || !isValidProfile(input.profile)) {
    return { ok: false, error: "Role or profile is not valid." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Email is already in use." };

  try {
    const clubScopeId = await ensureClubScope(input.clubScopeId ?? "", input.profile);
    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        role: input.role,
        profile: input.profile,
        clubScopeId,
        passwordHash,
      },
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to create user.",
    };
  }

  revalidatePath("/departement");
  return { ok: true, users: await getUsers() };
}

export async function updateUser(input: {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: string;
  clubScopeId?: string;
  password?: string;
}): Promise<UsersActionResult> {
  const currentUser = await requireDepartmentManager();
  if (!currentUser) return { ok: false, error: "Access denied." };

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password?.trim();

  if (!input.id || !name || !email) {
    return { ok: false, error: "Id, name, and email are required." };
  }

  if (!isValidRole(input.role) || !isValidProfile(input.profile)) {
    return { ok: false, error: "Role or profile is not valid." };
  }

  const user = await prisma.user.findUnique({ where: { id: input.id } });
  if (!user) return { ok: false, error: "User not found." };

  if (user.email !== email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { ok: false, error: "Email is already in use." };
  }

  try {
    const clubScopeId = await ensureClubScope(input.clubScopeId ?? "", input.profile);
    const data: {
      name: string;
      email: string;
      role: UserRoleOption;
      profile: UserProfileOption;
      clubScopeId: string | null;
      passwordHash?: string;
    } = {
      name,
      email,
      role: input.role,
      profile: input.profile,
      clubScopeId,
    };

    if (password) {
      if (password.length < 8) {
        return { ok: false, error: "Password must be at least 8 characters." };
      }
      data.passwordHash = await hashPassword(password);
    }

    await prisma.user.update({ where: { id: input.id }, data });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to update user.",
    };
  }

  revalidatePath("/departement");
  return { ok: true, users: await getUsers() };
}

export async function deleteUser(input: { id: string }): Promise<UsersActionResult> {
  const currentUser = await requireDepartmentManager();
  if (!currentUser) return { ok: false, error: "Access denied." };

  if (!input.id) return { ok: false, error: "User id is required." };
  if (input.id === currentUser.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  await prisma.session.deleteMany({ where: { userId: input.id } });
  await prisma.user.delete({ where: { id: input.id } });

  revalidatePath("/departement");
  return { ok: true, users: await getUsers() };
}
