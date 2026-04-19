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
    {
      label: "Utilisateurs",
      value: stats.usersCount,
      classes: "border-violet-200/80 bg-gradient-to-br from-violet-50 to-background text-violet-900",
      chipClasses: "bg-violet-100 text-violet-700",
    },
    {
      label: "Livres",
      value: stats.booksCount,
      classes: "border-sky-200/80 bg-gradient-to-br from-sky-50 to-background text-sky-900",
      chipClasses: "bg-sky-100 text-sky-700",
    },
    {
      label: "Clubs",
      value: stats.clubsCount,
      classes: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-background text-emerald-900",
      chipClasses: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Membres de clubs",
      value: stats.clubMembersCount,
      classes: "border-amber-200/80 bg-gradient-to-br from-amber-50 to-background text-amber-900",
      chipClasses: "bg-amber-100 text-amber-700",
    },
    {
      label: "Ambassadeurs",
      value: stats.ambassadorsCount,
      classes: "border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-background text-indigo-900",
      chipClasses: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Sessions actives",
      value: stats.activeSessionsCount,
      classes: "border-cyan-200/80 bg-gradient-to-br from-cyan-50 to-background text-cyan-900",
      chipClasses: "bg-cyan-100 text-cyan-700",
    },
    {
      label: "Mouvements financiers",
      value: stats.financeEntriesCount,
      classes: "border-rose-200/80 bg-gradient-to-br from-rose-50 to-background text-rose-900",
      chipClasses: "bg-rose-100 text-rose-700",
    },
    {
      label: "Cotisations",
      value: stats.contributionsCount,
      classes: "border-fuchsia-200/80 bg-gradient-to-br from-fuchsia-50 to-background text-fuchsia-900",
      chipClasses: "bg-fuchsia-100 text-fuchsia-700",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenue {user.name}. Profil actif: {user.profile}.</p>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground shadow-sm">
        {profileDescriptions[user.profile]}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className={`group rounded-xl border p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.classes}`}
          >
            <p className="line-clamp-2 min-h-10 text-xs font-medium md:text-sm">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="truncate text-xl font-semibold tracking-tight md:text-2xl">
                {numberFormatter.format(card.value)}
              </p>
              <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${card.chipClasses}`}>
                recap
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
