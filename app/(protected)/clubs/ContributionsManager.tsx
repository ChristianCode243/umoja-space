"use client";

import { useMemo, useState, useTransition } from "react";
import { createClubContribution } from "./actions";
import type { ClubContributionItem, ClubMemberOption } from "./queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContributionsManagerProps = {
  initialContributions: ClubContributionItem[];
  members: ClubMemberOption[];
  canCreate: boolean;
  readOnlyLabel?: string;
};

export function ContributionsManager({
  initialContributions,
  members,
  canCreate,
  readOnlyLabel,
}: ContributionsManagerProps) {
  const [contributions, setContributions] = useState(initialContributions);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const memberById = useMemo(() => {
    return new Map(members.map((member) => [member.id, member]));
  }, [members]);

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

      {canCreate && (
        <form action={handleSubmit} className="grid gap-3 rounded-md border p-3 md:grid-cols-4">
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

          <div className="space-y-1 md:col-span-3">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optionnel" />
          </div>

          <div className="md:col-span-1 md:flex md:items-end">
            <Button type="submit" disabled={isPending || members.length === 0} className="w-full">
              Ajouter
            </Button>
          </div>

          {error && <p className="text-sm text-destructive md:col-span-4">{error}</p>}
        </form>
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
            {contributions.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{row.monthKey}</td>
                <td className="py-2 pr-3">{row.clubName}</td>
                <td className="py-2 pr-3">{row.memberName}</td>
                <td className="py-2 pr-3">{(row.amountCents / 100).toFixed(2)}</td>
                <td className="py-2">{new Date(row.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {contributions.length === 0 && (
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
