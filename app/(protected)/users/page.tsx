// Users management page (server component).
import { requireUser } from "@/lib/auth";
import { getUsers } from "./queries";
import { UsersManager } from "./UsersManager";

export default async function UsersPage() {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN") {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Acces refuse</h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour gerer les utilisateurs.
        </p>
      </section>
    );
  }

  const users = await getUsers();

  return (
    <UsersManager
      initialUsers={users}
      currentUserEmail={currentUser.email}
    />
  );
}
