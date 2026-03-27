// Types used by the Books UI.
export type AuthorOption = {
  id: string;
  name: string;
};

export type DesignerOption = {
  id: string;
  name: string;
};

export type BookListItem = {
  id: string;
  title: string;
  isbn: string | null;
  authorId: string;
  authorName: string;
  designerId: string | null;
  designerName: string | null;
  description: string | null;
  publisher: string | null;
  publishedAt: string | null;
  language: string | null;
  pageCount: number | null;
  pricePaperCents: number;
  priceEbookCents: number;
  createdAt: string;
};

export type BooksActionResult =
  | { ok: true; books: BookListItem[] }
  | { ok: false; error: string };
