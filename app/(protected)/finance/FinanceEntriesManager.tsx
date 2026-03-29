"use client";

import { useState, useTransition } from "react";
import { createFinanceEntry } from "./actions";
import type { FinanceEntryListItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORY_OPTIONS = {
  INCOME: [
    { value: "edition_livre", label: "Edition livre" },
    { value: "vente_livre", label: "Vente livre" },
    { value: "frais_formation", label: "Frais de formation" },
    { value: "subvention", label: "Subvention" },
    { value: "prestation_annexe", label: "Prestation annexe" },
    { value: "partenariat_sponsoring", label: "Partenariats et sponsoring" },
    { value: "autre", label: "Autre" },
  ],
  EXPENSE: [
    { value: "achat_materiel", label: "Achat materiel" },
    { value: "production_editoriale", label: "Production editoriale" },
    { value: "distribution_commercialisation", label: "Distribution et commercialisation" },
    { value: "charge_administrative_fiscale", label: "Charge administrative et fiscale" },
    { value: "autre", label: "Autre" },
  ],
} as const;

const CATEGORY_LABELS: Record<string, string> = Object.values(CATEGORY_OPTIONS)
  .flat()
  .reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

type FinanceEntriesManagerProps = {
  initialEntries: FinanceEntryListItem[];
  initialSummary: {
    totalIncomeCents: number;
    totalExpenseCents: number;
    caisseCents: number;
  };
  canCreate: boolean;
};

export function FinanceEntriesManager({
  initialEntries,
  initialSummary,
  canCreate,
}: FinanceEntriesManagerProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [summary, setSummary] = useState({
    income: initialSummary.totalIncomeCents,
    expense: initialSummary.totalExpenseCents,
    caisse: initialSummary.caisseCents,
  });
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

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
        setSummary((prev) => {
          const income =
            result.entry.type === "INCOME"
              ? prev.income + result.entry.amountCents
              : prev.income;
          const expense =
            result.entry.type === "EXPENSE"
              ? prev.expense + result.entry.amountCents
              : prev.expense;
          return {
            income,
            expense,
            caisse: income - expense,
          };
        });
      });
    });
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total entrees</p>
          <p className="text-xl font-semibold">{(summary.income / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total sorties</p>
          <p className="text-xl font-semibold">{(summary.expense / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Caisse actuelle</p>
          <p className="text-xl font-semibold">{(summary.caisse / 100).toFixed(2)}</p>
        </div>
      </div>

      {canCreate && (
        <>
          <Button type="button" onClick={() => setIsModalOpen(true)}>
            Ajouter un mouvement
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau mouvement financier</DialogTitle>
                <DialogDescription>
                  Saisissez une entree ou une sortie avec sa categorie.
                </DialogDescription>
              </DialogHeader>
              <form action={handleSubmit} className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={entryType}
                    onChange={(event) => setEntryType(event.target.value as "INCOME" | "EXPENSE")}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
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
                  <select
                    id="category"
                    name="category"
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    required
                  >
                    {CATEGORY_OPTIONS[entryType].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="occurredAt">Date</Label>
                  <Input id="occurredAt" name="occurredAt" type="date" required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" name="notes" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isPending}>Enregistrer le mouvement</Button>
                </div>
                {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="finance-search">Recherche</Label>
          <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
            <InputGroupAddon className="text-muted-foreground">
              <Search className="size-4" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="finance-search"
              placeholder="Categorie, notes, auteur..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </InputGroup>
        </div>
        <div>
          <Label htmlFor="finance-type-filter">Filtrer type</Label>
          <select
            id="finance-type-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "ALL" | "INCOME" | "EXPENSE")
            }
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="ALL">Tous</option>
            <option value="INCOME">Entrees</option>
            <option value="EXPENSE">Sorties</option>
          </select>
        </div>
      </div>

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
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="px-3 py-2">{new Date(entry.occurredAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{entry.type === "INCOME" ? "Entree" : "Sortie"}</td>
                <td className="px-3 py-2">{CATEGORY_LABELS[entry.category] ?? entry.category}</td>
                <td className="px-3 py-2">{(entry.amountCents / 100).toFixed(2)}</td>
                <td className="px-3 py-2">{entry.createdByName}</td>
                <td className="px-3 py-2">{entry.notes ?? "-"}</td>
              </tr>
            ))}
            {filteredEntries.length === 0 && (
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
