// Ambassadors management page (server component).
import { requireUser } from "@/lib/auth";
import { getClubOptions } from "@/app/(protected)/clubs/queries";
import { getAmbassadors } from "./queries";
import { AmbassadorsManager } from "./AmbassadorsManager";

export default async function AmbassadeursPage() {
  const currentUser = await requireUser();

  if (!["ADMIN", "INFORMATICIEN", "CHEF_CLUB"].includes(currentUser.profile)) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les ambassadeurs.
        </p>
      </section>
    );
  }

  const [ambassadors, clubs] = await Promise.all([
    getAmbassadors(),
    getClubOptions(),
  ]);

  return (
    <AmbassadorsManager initialAmbassadors={ambassadors} clubs={clubs} />
  );
}
