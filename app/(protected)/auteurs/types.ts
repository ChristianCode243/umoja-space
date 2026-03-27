// Types used by the Authors UI.
export type AuthorListItem = {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  booksCount: number;
  createdAt: string;
};

export type AuthorsActionResult =
  | { ok: true; authors: AuthorListItem[] }
  | { ok: false; error: string };
