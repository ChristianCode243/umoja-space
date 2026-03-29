import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";

export default async function FinancePage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse a la section Finance.</p>;
  }

  if (user.profile === "FINANCIER" || user.profile === "ADMIN" || user.profile === "INFORMATICIEN") {
    redirect("/finance/entrees-sorties");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Finance</h1>
      <p className="text-muted-foreground">Utilisez les sous-pages pour gerer les operations financieres.</p>
      <div className="flex gap-3">
        <Link className="underline" href="/finance/entrees-sorties">Entrees / Sorties</Link>
        <Link className="underline" href="/finance/cotisations">Cotisations</Link>
      </div>
    </section>
  );
}
