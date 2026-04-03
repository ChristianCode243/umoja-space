"use client";

import { useMemo, useState, useTransition } from "react";
import { saveClubContributionsMatrix } from "./actions";
import type { ClubContributionItem, ClubMemberOption } from "./queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

type ContributionsSpreadsheetProps = {
  members: ClubMemberOption[];
  initialContributions: ClubContributionItem[];
  canEdit: boolean;
};

export function ContributionsSpreadsheet({
  members,
  initialContributions,
  canEdit,
}: ContributionsSpreadsheetProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [amount, setAmount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selectedByMember, setSelectedByMember] = useState<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {};
    for (const member of members) {
      map[member.id] = new Set();
    }

    for (const row of initialContributions) {
      if (!map[row.memberId]) {
        continue;
      }
      if (!row.monthKey.startsWith(`${currentYear}-`)) {
        continue;
      }
      map[row.memberId].add(row.monthKey);
    }

    return map;
  });

  const totals = useMemo(() => {
    let checkedCount = 0;
    Object.values(selectedByMember).forEach((months) => {
      checkedCount += months.size;
    });

    const monthlyAmount = Number(amount || 0);
    const totalCents = Number.isFinite(monthlyAmount) && monthlyAmount > 0
      ? Math.round(monthlyAmount * 100 * checkedCount)
      : 0;

    return { checkedCount, totalCents };
  }, [amount, selectedByMember]);

  function toggle(memberId: string, monthKey: string, checked: boolean) {
    setSelectedByMember((prev) => {
      const next = { ...prev };
      const existing = new Set(next[memberId] ?? []);
      if (checked) {
        existing.add(monthKey);
      } else {
        existing.delete(monthKey);
      }
      next[memberId] = existing;
      return next;
    });
  }

  function handleSave() {
    setError(null);

    const payload: Record<string, string[]> = {};
    for (const member of members) {
      payload[member.id] = Array.from(selectedByMember[member.id] ?? []);
    }

    startTransition(() => {
      saveClubContributionsMatrix({
        year,
        amount,
        selectedByMember: payload,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
      });
    });
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div>
        <h2 className="text-xl font-semibold">Cotisations (tableur)</h2>
        <p className="text-sm text-muted-foreground">
          Colonnes: mois de l&apos;annee. Lignes: membres. {canEdit ? "Cochez puis enregistrez." : "Lecture seule."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-2 md:p-3">
          <p className="text-[10px] text-emerald-700 md:text-xs">Cases cochees</p>
          <p className="text-sm font-semibold text-emerald-900 md:text-xl">{totals.checkedCount}</p>
        </div>
        <div className="rounded-lg border border-sky-300 bg-sky-50/80 p-2 md:p-3">
          <p className="text-[10px] text-sky-700 md:text-xs">Montant mensuel</p>
          <p className="text-sm font-semibold text-sky-900 md:text-xl">{Number(amount || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-2 md:p-3">
          <p className="text-[10px] text-amber-700 md:text-xs">Total annuel</p>
          <p className="text-sm font-semibold text-amber-900 md:text-xl">{(totals.totalCents / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="year">Annee</Label>
          <Input
            id="year"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(event) => setYear(Number(event.target.value || currentYear))}
            disabled={!canEdit}
            className="w-32"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount">Montant mensuel</Label>
          <Input
            id="amount"
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={!canEdit}
            className="w-40"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">Membre</th>
              {MONTHS.map((month) => (
                <th key={month} className="px-2 py-2 text-center">{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">{member.name}</td>
                {MONTHS.map((month) => {
                  const monthKey = `${year}-${month}`;
                  const checked = selectedByMember[member.id]?.has(monthKey) ?? false;
                  return (
                    <td key={`${member.id}-${month}`} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => toggle(member.id, monthKey, event.target.checked)}
                        disabled={!canEdit || isPending}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-5 text-center text-muted-foreground">
                  Aucun membre disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <Button type="button" onClick={handleSave} disabled={isPending}>
          Enregistrer les modifications
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
