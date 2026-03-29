import { requireUser } from "@/lib/auth";

const profileDescriptions: Record<string, string> = {
  ADMIN: "Vision globale de tous les departements et indicateurs transversaux.",
  FINANCIER: "Suivi des entrees/sorties, repartition des revenus et contributions.",
  LOGISTICIEN: "Mouvements des ressources non financieres et gestion des livres.",
  CHEF_CLUB: "Pilotage de votre club, membres et cotisations mensuelles.",
  AMBASSADEUR: "Ajout de membres dans votre club et suivi des contributions.",
  DESIGNER: "Projets design, livrables et revenus associes a vos projets.",
  INFORMATICIEN: "Supervision technique complete, acces global sans restriction.",
  AUTEUR: "Suivi de vos livres, publications et informations editoriales.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Bienvenue {user.name}. Profil actif: {user.profile}.</p>
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        {profileDescriptions[user.profile]}
      </div>
    </section>
  );
}
