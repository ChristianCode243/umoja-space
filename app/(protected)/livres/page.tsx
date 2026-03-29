// Books management page (server component).
import { requireUser } from "@/lib/auth";
import { getAuthorOptions, getBooks, getDesignerOptions } from "./queries";
import { BooksManager } from "./BooksManager";

export default async function LivresPage() {
  const currentUser = await requireUser();

  if (!["ADMIN", "INFORMATICIEN", "LOGISTICIEN"].includes(currentUser.profile)) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les livres.
        </p>
      </section>
    );
  }

  const [books, authors, designers] = await Promise.all([
    getBooks(),
    getAuthorOptions(),
    getDesignerOptions(),
  ]);

  return (
    <BooksManager
      initialBooks={books}
      authors={authors}
      designers={designers}
    />
  );
}
