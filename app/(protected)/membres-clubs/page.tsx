// Club members management page (server component).
import { requireUser } from "@/lib/auth";
import { getClubOptions } from "@/app/(protected)/clubs/queries";
import { getClubMembers } from "./queries";
import { ClubMembersManager } from "./ClubMembersManager";

export default async function MembresClubsPage() {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF") {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les membres.
        </p>
      </section>
    );
  }

  const [members, clubs] = await Promise.all([
    getClubMembers(),
    getClubOptions(),
  ]);

  return <ClubMembersManager initialMembers={members} clubs={clubs} />;
}
