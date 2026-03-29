// Designers management page (server component).
import { requireUser } from "@/lib/auth";
import { getDesigners } from "./queries";
import { DesignersManager } from "./DesignersManager";

export default async function DesignersPage() {
  const currentUser = await requireUser();

  if (!["ADMIN", "INFORMATICIEN", "LOGISTICIEN", "DESIGNER"].includes(currentUser.profile)) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les designers.
        </p>
      </section>
    );
  }

  const designers = await getDesigners();

  return <DesignersManager initialDesigners={designers} />;
}
