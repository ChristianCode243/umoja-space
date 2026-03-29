import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection, hasFullAccess } from "@/lib/access";
import { ContributionsManager } from "./ContributionsManager";
import { ClubsManager } from "./ClubsManager";
import { getClubContributions, getClubMemberOptions, getClubsByScope } from "./queries";

export default async function ClubsPage() {
  const user = await requireUser();

  if (!canAccessSection(user, "clubs")) {
    return <p className="text-muted-foreground">Acces refuse a la section Clubs.</p>;
  }

  const scopedClubId = user.clubScopeId && !hasFullAccess(user) ? user.clubScopeId : undefined;

  const [clubs, members, contributions] = await Promise.all([
    hasFullAccess(user) ? getClubsByScope() : getClubsByScope(scopedClubId),
    getClubMemberOptions(scopedClubId),
    getClubContributions(scopedClubId),
  ]);

  const canCreateContribution =
    user.profile === "ADMIN" ||
    user.profile === "INFORMATICIEN" ||
    user.profile === "CHEF_CLUB";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Clubs</h1>
        <p className="text-muted-foreground">
          Espace clubs pour les chefs de club et ambassadeurs.
        </p>
      </div>

      <ClubsManager
        initialClubs={clubs}
        canCreateClub={hasFullAccess(user)}
        canDeleteClub={hasFullAccess(user)}
      />

      <div className="rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Membres du club</h2>
        <p className="text-sm text-muted-foreground">
          Les ambassadeurs peuvent uniquement ajouter des membres, et consulter le tableau des cotisations.
        </p>
        <Link href="/membres-clubs" className="mt-2 inline-block text-sm underline">
          Ouvrir la gestion des membres
        </Link>
      </div>

      <ContributionsManager
        initialContributions={contributions}
        members={members}
        canCreate={canCreateContribution}
      />

      <div className="text-xs text-muted-foreground">{members.length} membre(s) affiches.</div>
    </section>
  );
}
