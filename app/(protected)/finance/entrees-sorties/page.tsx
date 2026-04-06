import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { FinanceEntriesManager } from "../FinanceEntriesManager";
import { getFinanceEntries, getFinanceSummary } from "../queries";

export default async function FinanceCashflowPage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const [entries, summary] = await Promise.all([getFinanceEntries(), getFinanceSummary()]);
  const canCreate = ["ADMIN", "INFORMATICIEN", "FINANCIER"].includes(user.profile);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Finance - Entrees / Sorties</h1>
        <Link href="/finance/cotisations" className="text-sm underline">Voir les cotisations</Link>
        <Link href="/finance/livre-journal" className="text-sm underline">Voir le livre journal</Link>
      </div>
      <FinanceEntriesManager initialEntries={entries} initialSummary={summary} canCreate={canCreate} />
    </div>
  );
}
