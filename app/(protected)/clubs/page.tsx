import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection, hasFullAccess } from "@/lib/access";
import { ContributionsManager } from "./ContributionsManager";
import { ContributionsSpreadsheet } from "./ContributionsSpreadsheet";
import { ClubsManager } from "./ClubsManager";
import {
  getClubContributions,
  getClubMemberOptions,
  getClubsByScope,
} from "./queries";

export default async function ClubsPage() {
  const user = await requireUser();

  if (!canAccessSection(user, "clubs")) {
    return <p className="text-muted-foreground">Acces refuse a la section Clubs.</p>;
  }

  const scopedClubId = user.clubScopeId && !hasFullAccess(user) ? user.clubScopeId : undefined;
  const canManageClubs = hasFullAccess(user);
  const usesSpreadsheet = user.profile === "CHEF_CLUB" || user.profile === "AMBASSADEUR";
  const canManageContributions = user.profile === "CHEF_CLUB" || hasFullAccess(user);

  const [clubs, members, contributions] = await Promise.all([
    getClubsByScope(scopedClubId),
    getClubMemberOptions(scopedClubId),
    getClubContributions(scopedClubId),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Clubs</h1>
        <p className="text-muted-foreground">
          Espace clubs pour les chefs de club et ambassadeurs.
        </p>
      </div>

      {canManageClubs && (
        <ClubsManager initialClubs={clubs} />
      )}

      {!canManageClubs && user.profile === "CHEF_CLUB" && (
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold">Votre club</h2>
          <p className="text-sm text-muted-foreground">
            En tant que chef de club, vous voyez uniquement les donnees de votre club.
          </p>
          <p className="mt-2 text-sm font-medium">{clubs[0]?.name ?? "Club non assigne"}</p>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Membres du club</h2>
        <p className="text-sm text-muted-foreground">
          Gerer les membres de votre perimetre.
        </p>
        <Link href="/membres-clubs" className="mt-2 inline-block text-sm underline">
          Ouvrir la gestion des membres
        </Link>
      </div>

      {usesSpreadsheet ? (
        <ContributionsSpreadsheet
          initialContributions={contributions}
          members={members}
          canEdit={user.profile === "CHEF_CLUB"}
        />
      ) : (
        <ContributionsManager
          initialContributions={contributions}
          members={members}
          canCreate={canManageContributions}
          readOnlyLabel="(lecture seule)"
        />
      )}
      <div className="text-xs text-muted-foreground">{members.length} membre(s) dans votre perimetre.</div>
    </section>
  );
}
