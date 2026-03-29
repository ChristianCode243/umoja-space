import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";

export default async function FinancePage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse a la section Finance.</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Finance</h1>
      <p className="text-muted-foreground">
        Espace financier: suivi des entrees/sorties, repartitions par departement et
        contributions.
      </p>
      <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
        <li>Revenus et depenses globales.</li>
        <li>Repartition des revenus des projets (designers et departements).</li>
        <li>Suivi des contributions mensuelles des clubs.</li>
      </ul>
      <p className="text-sm">
        Les donnees de cotisation sont visibles depuis la section <Link href="/clubs" className="underline">Clubs</Link>.
      </p>
    </section>
  );
}
