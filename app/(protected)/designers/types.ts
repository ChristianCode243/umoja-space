// Types used by the Designers UI.
export type DesignerListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  portfolioUrl: string | null;
  country: string | null;
  bio: string | null;
  createdAt: string;
};

export type DesignersActionResult =
  | { ok: true; designers: DesignerListItem[] }
  | { ok: false; error: string };
