"use server";

// Shared auth actions for client components (e.g., navbar logout).
import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";

export async function logout(): Promise<void> {
  // Clear the session and send the user back to the login page.
  await clearSession();
  redirect("/login");
}
