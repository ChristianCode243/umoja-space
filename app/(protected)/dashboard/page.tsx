import { requireUser } from "@/lib/auth";
import { getDashboardStats } from "./queries";

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

const numberFormatter = new Intl.NumberFormat("fr-FR");

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Utilisateurs", value: stats.usersCount },
    { label: "Livres", value: stats.booksCount },
    { label: "Clubs", value: stats.clubsCount },
    { label: "Membres de clubs", value: stats.clubMembersCount },
    { label: "Ambassadeurs", value: stats.ambassadorsCount },
    { label: "Sessions actives", value: stats.activeSessionsCount },
    { label: "Mouvements financiers", value: stats.financeEntriesCount },
    { label: "Cotisations", value: stats.contributionsCount },
  ];

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenue {user.name}. Profil actif: {user.profile}.</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        {profileDescriptions[user.profile]}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {numberFormatter.format(card.value)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
