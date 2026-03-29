"use server";

// Server action to authenticate users with email and password.
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { logServerError } from "@/lib/action-error";

export type LoginState = {
  error?: string;
};

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    // Basic validation to avoid empty submits.
    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid credentials." };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid credentials." };
    }

    await createSession(user.id);
    redirect("/dashboard");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    logServerError("login", error);
    return { error: "Une erreur est survenue pendant la connexion." };
  }
}
