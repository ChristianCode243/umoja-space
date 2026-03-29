export type FinanceEntryListItem = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  category: string;
  notes: string | null;
  occurredAt: string;
  createdByName: string;
};

export type FinanceEntryActionResult =
  | { ok: true; entry: FinanceEntryListItem }
  | { ok: false; error: string };
