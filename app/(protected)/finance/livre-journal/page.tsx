import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function FinanceJournalPage() {
  const user = await requireUser();
  if (!canAccessSection(user, "finance")) {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const rows = await prisma.journalEntry.findMany({
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { name: true } } },
    take: 300,
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Finance - Livre journal</h1>
        <Link href="/finance/entrees-sorties" className="text-sm underline">Voir entrees/sorties</Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Traçabilité comptable: chaque mouvement est journalisé en débit ou crédit.
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Debit</th>
              <th className="px-3 py-2">Credit</th>
              <th className="px-3 py-2">Saisi par</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">{new Date(row.occurredAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.sourceType}</td>
                <td className="px-3 py-2">{row.description ?? "-"}</td>
                <td className="px-3 py-2">{row.side === "DEBIT" ? (row.amountCents / 100).toFixed(2) : "-"}</td>
                <td className="px-3 py-2">{row.side === "CREDIT" ? (row.amountCents / 100).toFixed(2) : "-"}</td>
                <td className="px-3 py-2">{row.createdBy?.name ?? "Systeme"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Aucun mouvement journalise.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
