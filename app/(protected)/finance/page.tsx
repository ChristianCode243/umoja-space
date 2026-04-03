import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { getFinanceSummary } from "./queries";

export default async function FinancePage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse a la section Finance.</p>;
  }
  const summary = await getFinanceSummary();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Finance</h1>
      <p className="text-muted-foreground">
        Espace financier: suivi de la caisse, des entrees/sorties et des cotisations.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total entrees</p>
          <p className="text-xl font-semibold">{(summary.totalIncomeCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total sorties</p>
          <p className="text-xl font-semibold">{(summary.totalExpenseCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Caisse actuelle</p>
          <p className="text-xl font-semibold">{(summary.caisseCents / 100).toFixed(2)}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/finance/entrees-sorties" className="rounded-lg border p-4 hover:bg-muted/30">
          <h2 className="font-semibold">Entrees / Sorties</h2>
          <p className="text-sm text-muted-foreground">
            Ajouter et consulter les mouvements de caisse.
          </p>
        </Link>
        <Link href="/finance/cotisations" className="rounded-lg border p-4 hover:bg-muted/30">
          <h2 className="font-semibold">Cotisations</h2>
          <p className="text-sm text-muted-foreground">
            Consulter les cotisations des clubs (lecture seule).
          </p>
        </Link>
      </div>
    </section>
  );
}
