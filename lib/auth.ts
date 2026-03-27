// Authentication helpers based on server-side sessions stored in the database.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

const SESSION_COOKIE_NAME = "umja_session";
const SESSION_MAX_AGE_DAYS = 7;

function hashToken(token: string): string {
  // Hash tokens before storing them in the database.
  return createHash("sha256").update(token).digest("hex");
}

function getSessionExpiry(): Date {
  // Compute the session expiration date.
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);
  return expiresAt;
}

export async function createSession(userId: string): Promise<void> {
  // Create a new session and store only the hashed token in DB.
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  // cookies() is async in Next 16, so unwrap it before use.
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(): Promise<User | null> {
  // Read the current user from the session cookie.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }

  const tokenHash = hashToken(sessionCookie.value);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    // Clean up expired sessions to keep the DB tidy.
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireUser(): Promise<User> {
  // Redirect to login if the user is not authenticated.
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function clearSession(): Promise<void> {
  // Remove the session record and clear the cookie.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return;
  }

  const tokenHash = hashToken(sessionCookie.value);
  await prisma.session.deleteMany({ where: { tokenHash } });

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
