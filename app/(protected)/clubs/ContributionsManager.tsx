"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { createClubContribution } from "./actions";
import type { ClubContributionItem, ClubMemberOption } from "./queries";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

type ContributionsManagerProps = {
  initialContributions: ClubContributionItem[];
  members: ClubMemberOption[];
  canCreate: boolean;
  readOnlyLabel?: string;
  enableClubFilter?: boolean;
};

export function ContributionsManager({
  initialContributions,
  members,
  canCreate,
  readOnlyLabel,
  enableClubFilter = false,
}: ContributionsManagerProps) {
  const [contributions, setContributions] = useState(initialContributions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const memberById = useMemo(() => {
    return new Map(members.map((member) => [member.id, member]));
  }, [members]);

  const uniqueMonths = useMemo(() => {
    const keys = new Set(contributions.map((row) => row.monthKey));
    return Array.from(keys).sort().reverse();
  }, [contributions]);

  const filteredContributions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return contributions.filter((row) => {
      if (monthFilter !== "ALL" && row.monthKey !== monthFilter) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return [row.clubName, row.memberName, row.monthKey, row.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [contributions, monthFilter, searchTerm]);

  const totals = useMemo(() => {
    const totalCents = contributions.reduce((sum, row) => sum + row.amountCents, 0);
    const filteredCents = filteredContributions.reduce((sum, row) => sum + row.amountCents, 0);
    return {
      totalCents,
      filteredCents,
      count: contributions.length,
      filteredCount: filteredContributions.length,
    };
  }, [contributions, filteredContributions]);

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      memberId: String(formData.get("memberId") || ""),
      monthKey: String(formData.get("monthKey") || ""),
      amount: String(formData.get("amount") || ""),
      notes: String(formData.get("notes") || ""),
    };

    startTransition(() => {
      createClubContribution(payload).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        const member = memberById.get(payload.memberId);
        if (!member) {
          return;
        }

        const next: ClubContributionItem = {
          id: `tmp-${Date.now()}`,
          clubId: member.clubId,
          clubName: member.clubName,
          memberId: member.id,
          memberName: member.name,
          monthKey: payload.monthKey,
          amountCents: Math.round(Number(payload.amount) * 100),
          paidAt: new Date().toISOString(),
          notes: payload.notes || null,
        };

        setContributions((prev) => [next, ...prev].slice(0, 120));
        setIsModalOpen(false);
      });
    });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <h2 className="text-xl font-semibold">Cotisations</h2>
        <p className="text-sm text-muted-foreground">
          Suivi des cotisations mensuelles des membres.
          {!canCreate && readOnlyLabel ? ` ${readOnlyLabel}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-2 md:p-3">
          <p className="text-[10px] text-emerald-700 md:text-xs">Total cotisations</p>
          <p className="text-sm font-semibold text-emerald-900 md:text-xl">{(totals.totalCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-2 md:p-3">
          <p className="text-[10px] text-amber-700 md:text-xs">Resultat filtre</p>
          <p className="text-sm font-semibold text-amber-900 md:text-xl">{(totals.filteredCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-sky-300 bg-sky-50/80 p-2 md:p-3">
          <p className="text-[10px] text-sky-700 md:text-xs">Lignes</p>
          <p className="text-sm font-semibold text-sky-900 md:text-xl">{totals.filteredCount} / {totals.count}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="contribution-search">Recherche</Label>
          <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
            <InputGroupAddon className="text-muted-foreground">
              <Search className="size-4" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="contribution-search"
              placeholder="Membre, club, mois, notes..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </InputGroup>
        </div>
        <div>
          <Label htmlFor="month-filter">Filtrer par mois</Label>
          <select
            id="month-filter"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="ALL">Tous les mois</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {canCreate && (
        <>
          <Button type="button" onClick={() => setIsModalOpen(true)} disabled={members.length === 0}>
            Ajouter une cotisation
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle cotisation</DialogTitle>
                <DialogDescription>
                  Saisissez une cotisation mensuelle d&apos;un membre.
                </DialogDescription>
              </DialogHeader>
              <form action={handleSubmit} className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="memberId">Membre</Label>
                  <select
                    id="memberId"
                    name="memberId"
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">Selectionnez un membre</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.clubName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="monthKey">Mois</Label>
                  <Input id="monthKey" name="monthKey" type="month" required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="amount">Montant</Label>
                  <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" name="notes" placeholder="Optionnel" />
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" disabled={isPending}>Enregistrer la cotisation</Button>
                </div>

                {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-3">Mois</th>
              <th className="py-2 pr-3">Club</th>
              <th className="py-2 pr-3">Membre</th>
              <th className="py-2 pr-3">Montant</th>
              <th className="py-2">Paiement</th>
            </tr>
          </thead>
          <tbody>
            {filteredContributions.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{row.monthKey}</td>
                <td className="py-2 pr-3">{row.clubName}</td>
                <td className="py-2 pr-3">{row.memberName}</td>
                <td className="py-2 pr-3">{(row.amountCents / 100).toFixed(2)}</td>
                <td className="py-2">{new Date(row.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filteredContributions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-5 text-center text-muted-foreground">
                  Aucune cotisation enregistree.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
