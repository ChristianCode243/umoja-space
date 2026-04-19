import { requireUser } from "@/lib/auth";
import { ProfilForm } from "./ProfilForm";

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Mon profil</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez vos informations personnelles. Toute modification est auditée.
        </p>
      </div>
      <ProfilForm initialName={user.name} initialEmail={user.email} />
    </section>
  );
}
