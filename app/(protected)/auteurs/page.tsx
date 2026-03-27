// Authors management page (server component).
import { requireUser } from "@/lib/auth";
import { getAuthors } from "./queries";
import { AuthorsManager } from "./AuthorsManager";

export default async function AuteursPage() {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF") {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les auteurs.
        </p>
      </section>
    );
  }

  const authors = await getAuthors();

  return <AuthorsManager initialAuthors={authors} />;
}
