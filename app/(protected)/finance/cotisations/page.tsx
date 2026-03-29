import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { ContributionsManager } from "@/app/(protected)/clubs/ContributionsManager";
import { getClubContributions, getClubMemberOptions } from "@/app/(protected)/clubs/queries";

export default async function FinanceContributionsPage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const [contributions, members] = await Promise.all([
    getClubContributions(),
    getClubMemberOptions(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Finance - Cotisations</h1>
        <Link href="/finance/entrees-sorties" className="text-sm underline">Voir entrees/sorties</Link>
      </div>
      <ContributionsManager
        initialContributions={contributions}
        members={members}
        canCreate={false}
        readOnlyLabel="(lecture seule pour le service finance)."
      />
    </div>
  );
}
