"use client";

import { useMemo, useState, useTransition } from "react";
import { createFinanceEntry } from "./actions";
import type { FinanceEntryListItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FinanceEntriesManagerProps = {
  initialEntries: FinanceEntryListItem[];
  canCreate: boolean;
};

export function FinanceEntriesManager({ initialEntries, canCreate }: FinanceEntriesManagerProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const income = entries.filter((entry) => entry.type === "INCOME").reduce((sum, entry) => sum + entry.amountCents, 0);
    const expense = entries.filter((entry) => entry.type === "EXPENSE").reduce((sum, entry) => sum + entry.amountCents, 0);
    return {
      income,
      expense,
      caisse: income - expense,
    };
  }, [entries]);

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      type: String(formData.get("type") || "INCOME") as "INCOME" | "EXPENSE",
      amount: String(formData.get("amount") || ""),
      category: String(formData.get("category") || ""),
      notes: String(formData.get("notes") || ""),
      occurredAt: String(formData.get("occurredAt") || ""),
    };

    startTransition(() => {
      createFinanceEntry(payload).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setEntries((prev) => [result.entry, ...prev].slice(0, 120));
      });
    });
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total entrees</p>
          <p className="text-xl font-semibold">{(totals.income / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total sorties</p>
          <p className="text-xl font-semibold">{(totals.expense / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Caisse actuelle</p>
          <p className="text-xl font-semibold">{(totals.caisse / 100).toFixed(2)}</p>
        </div>
      </div>

      {canCreate && (
        <form action={handleSubmit} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <select id="type" name="type" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="INCOME">Entree</option>
              <option value="EXPENSE">Sortie</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Montant</Label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Categorie</Label>
            <Input id="category" name="category" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="occurredAt">Date</Label>
            <Input id="occurredAt" name="occurredAt" type="date" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" />
          </div>
          <div className="md:col-span-5">
            <Button type="submit" disabled={isPending}>Ajouter le mouvement</Button>
          </div>
          {error && <p className="text-sm text-destructive md:col-span-5">{error}</p>}
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Categorie</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Saisi par</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="px-3 py-2">{new Date(entry.occurredAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{entry.type === "INCOME" ? "Entree" : "Sortie"}</td>
                <td className="px-3 py-2">{entry.category}</td>
                <td className="px-3 py-2">{(entry.amountCents / 100).toFixed(2)}</td>
                <td className="px-3 py-2">{entry.createdByName}</td>
                <td className="px-3 py-2">{entry.notes ?? "-"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Aucun mouvement enregistre.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
