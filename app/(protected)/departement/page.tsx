import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { UsersManager } from "@/app/(protected)/users/UsersManager";
import { getUsers } from "@/app/(protected)/users/queries";
import { getClubOptions } from "@/app/(protected)/clubs/queries";

const miniTabs = [
  "Admin",
  "Financier",
  "Logisticien",
  "Chef de club",
  "Ambassadeur",
  "Designer",
  "Informaticien",
  "Auteur",
];

export default async function DepartementPage() {
  const user = await requireUser();

  if (!canAccessSection(user, "departement")) {
    redirect("/dashboard");
  }

  const [users, clubs] = await Promise.all([getUsers(), getClubOptions()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Departement</h1>
        <p className="text-muted-foreground">
          L&apos;admin gere ici le CRUD des utilisateurs et leurs profils.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {miniTabs.map((tab) => (
          <span key={tab} className="rounded-md border px-3 py-1 text-xs text-muted-foreground">
            {tab}
          </span>
        ))}
      </div>

      <UsersManager initialUsers={users} currentUserEmail={user.email} clubs={clubs} />
    </section>
  );
}
