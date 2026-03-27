// Clubs management page (server component).
import { requireUser } from "@/lib/auth";
import { getClubs } from "./queries";
import { ClubsManager } from "./ClubsManager";

export default async function ClubsPage() {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF") {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les clubs.
        </p>
      </section>
    );
  }

  const clubs = await getClubs();

  return <ClubsManager initialClubs={clubs} />;
}
