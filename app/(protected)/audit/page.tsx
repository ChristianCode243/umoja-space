import { requireUser } from "@/lib/auth";
import { getAuditLogs } from "./queries";

export default async function AuditPage() {
  const user = await requireUser();

  if (user.profile !== "ADMIN") {
    return <p className="text-muted-foreground">Acces refuse.</p>;
  }

  const logs = await getAuditLogs(200);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Audit & Logs</h1>
        <p className="text-sm text-muted-foreground">
          Historique des actions sensibles de la plateforme (admin uniquement).
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Acteur</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entite</th>
              <th className="px-3 py-2">Cible</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{log.actor?.name ?? "Systeme"}</div>
                  <div className="text-xs text-muted-foreground">{log.actor?.email ?? "-"}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{log.action}</td>
                <td className="px-3 py-2 whitespace-nowrap">{log.entityType}</td>
                <td className="px-3 py-2 whitespace-nowrap">{log.entityId ?? "-"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {log.details ? JSON.stringify(log.details) : "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Aucun evenement d&apos;audit pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
