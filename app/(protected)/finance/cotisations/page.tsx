import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { ContributionsManager } from "@/app/(protected)/clubs/ContributionsManager";
import { getClubContributions, getClubMemberOptions } from "@/app/(protected)/clubs/queries";
import { getFinanceSummary } from "../queries";

export default async function FinanceContributionsPage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const [contributions, members, summary] = await Promise.all([
    getClubContributions(),
    getClubMemberOptions(),
    getFinanceSummary(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Finance - Cotisations</h1>
        <Link href="/finance/entrees-sorties" className="text-sm underline">Voir entrees/sorties</Link>
        <Link href="/finance/livre-journal" className="text-sm underline">Voir le livre journal</Link>
      </div>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-2 md:p-3">
          <p className="text-[10px] text-emerald-700 md:text-xs">Cotisations</p>
          <p className="text-sm font-semibold text-emerald-900 md:text-xl">{(summary.totalContributionsCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-rose-300 bg-rose-50/80 p-2 md:p-3">
          <p className="text-[10px] text-rose-700 md:text-xs">Sorties</p>
          <p className="text-sm font-semibold text-rose-900 md:text-xl">{(summary.totalExpenseCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-sky-300 bg-sky-50/80 p-2 md:p-3">
          <p className="text-[10px] text-sky-700 md:text-xs">Caisse</p>
          <p className="text-sm font-semibold text-sky-900 md:text-xl">{(summary.caisseCents / 100).toFixed(2)}</p>
        </div>
      </div>
      <ContributionsManager
        initialContributions={contributions}
        members={members}
        canCreate={false}
        readOnlyLabel="(lecture seule pour le service finance)."
        enableClubFilter={user.profile === "FINANCIER"}
      />
    </div>
  );
}
