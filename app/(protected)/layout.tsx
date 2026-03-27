// Layout for all authenticated routes.
import { SiteNavbar } from "@/components/site-navbar";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enforce authentication for every route in this group.
  await requireUser();

  return (
    <>
      <SiteNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
