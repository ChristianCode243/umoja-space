import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";

export default async function LogistiquePage() {
  const user = await requireUser();
  if (!canAccessSection(user, "logistique")) {
    return <p className="text-muted-foreground">Acces refuse a la section Logistique.</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Logistique</h1>
      <p className="text-muted-foreground">
        Gestion des ressources non financieres et du flux des livres.
      </p>
      <div className="rounded-lg border p-4 text-sm">
        <p>Le module livres est pilote par la logistique.</p>
        <Link href="/livres" className="mt-2 inline-block underline">
          Ouvrir la gestion des livres
        </Link>
      </div>
    </section>
  );
}
