"use server";

// Server actions for user CRUD.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireUser } from "@/lib/auth";
import { getUsers } from "./queries";
import { USER_ROLES, type UserRoleOption } from "./constants";
import type { UsersActionResult } from "./types";

function isValidRole(role: string): role is UserRoleOption {
  return USER_ROLES.includes(role as UserRoleOption);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function requireAdminUser() {
  // Only admins can manage users.
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    return null;
  }
  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Promise<UsersActionResult> {
  const currentUser = await requireAdminUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const role = input.role;
  const password = input.password;

  if (!name || !email || !password) {
    return { ok: false, error: "Name, email, and password are required." };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (!isValidRole(role)) {
    return { ok: false, error: "Role is not valid." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Email is already in use." };
  }

  const passwordHash = await hashPassword(password);
  const typedRole = role as UserRoleOption;

  await prisma.user.create({
    data: {
      name,
      email,
      role: typedRole,
      passwordHash,
    },
  });

  revalidatePath("/users");
  return { ok: true, users: await getUsers() };
}

export async function updateUser(input: {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}): Promise<UsersActionResult> {
  const currentUser = await requireAdminUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const role = input.role;
  const password = input.password?.trim();

  if (!input.id || !name || !email) {
    return { ok: false, error: "Id, name, and email are required." };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "Email is not valid." };
  }

  if (!isValidRole(role)) {
    return { ok: false, error: "Role is not valid." };
  }

  const user = await prisma.user.findUnique({ where: { id: input.id } });
  if (!user) {
    return { ok: false, error: "User not found." };
  }

  if (user.email !== email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "Email is already in use." };
    }
  }

  const typedRole = role as UserRoleOption;
  const data: {
    name: string;
    email: string;
    role: UserRoleOption;
    passwordHash?: string;
  } = {
    name,
    email,
    role: typedRole,
  };

  if (password) {
    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }
    data.passwordHash = await hashPassword(password);
  }

  await prisma.user.update({
    where: { id: input.id },
    data,
  });

  revalidatePath("/users");
  return { ok: true, users: await getUsers() };
}

export async function deleteUser(input: {
  id: string;
}): Promise<UsersActionResult> {
  const currentUser = await requireAdminUser();
  if (!currentUser) {
    return { ok: false, error: "Access denied." };
  }

  if (!input.id) {
    return { ok: false, error: "User id is required." };
  }

  if (input.id === currentUser.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  await prisma.session.deleteMany({ where: { userId: input.id } });
  await prisma.user.delete({ where: { id: input.id } });

  revalidatePath("/users");
  return { ok: true, users: await getUsers() };
}
