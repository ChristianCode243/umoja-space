import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { FinanceEntriesManager } from "../FinanceEntriesManager";
import { getFinanceEntries } from "../queries";

export default async function FinanceCashflowPage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const entries = await getFinanceEntries();
  const canCreate = ["ADMIN", "INFORMATICIEN", "FINANCIER"].includes(user.profile);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Finance - Entrees / Sorties</h1>
        <Link href="/finance/cotisations" className="text-sm underline">Voir les cotisations</Link>
      </div>
      <FinanceEntriesManager initialEntries={entries} canCreate={canCreate} />
    </div>
  );
}
