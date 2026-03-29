import { requireUser } from "@/lib/auth";
import { getClubOptions } from "@/app/(protected)/clubs/queries";
import { getClubMembers } from "./queries";
import { ClubMembersManager } from "./ClubMembersManager";

export default async function MembresClubsPage() {
  const currentUser = await requireUser();

  if (
    !["ADMIN", "INFORMATICIEN", "CHEF_CLUB", "AMBASSADEUR"].includes(
      currentUser.profile
    )
  ) {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const scopedClubId =
    (currentUser.profile === "CHEF_CLUB" || currentUser.profile === "AMBASSADEUR") &&
    currentUser.clubScopeId
      ? currentUser.clubScopeId
      : undefined;

  const [members, clubs] = await Promise.all([
    getClubMembers(scopedClubId),
    getClubOptions(scopedClubId),
  ]);
  return <ClubMembersManager initialMembers={members} clubs={clubs} />;
}
