"use client";

// Client-side books management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { BookOpen, Pencil, Search, Trash2 } from "lucide-react";
import { createBook, deleteBook, updateBook } from "./actions";
import type { AuthorOption, BookListItem, DesignerOption } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BooksManagerProps = {
  initialBooks: BookListItem[];
  authors: AuthorOption[];
  designers: DesignerOption[];
};

type AuthorFilter = "ALL" | string;

const DEFAULT_PUBLISHER = "Umoja Editions";

function formatPrice(cents: number): string {
  // Format integer cents into a friendly price.
  return (cents / 100).toFixed(2);
}

function formatDateInput(value: string | null): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

export function BooksManager({ initialBooks, authors, designers }: BooksManagerProps) {
  const [books, setBooks] = useState<BookListItem[]>(initialBooks);
  const [editingBook, setEditingBook] = useState<BookListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>("ALL");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingBook?.id ?? "new";
  const hasAuthors = authors.length > 0;
  const hasDesigners = designers.length > 0;

  // Filter books in real-time as the search term or author filter changes.
  const filteredBooks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    let result = books;

    if (authorFilter !== "ALL") {
      result = result.filter((book) => book.authorId === authorFilter);
    }

    if (!normalized) {
      return result;
    }

    return result.filter((book) =>
      [
        book.title,
        book.isbn,
        book.authorName,
        book.publisher,
        book.language,
        book.designerName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [books, searchTerm, authorFilter]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      title: String(formData.get("title") || ""),
      isbn: String(formData.get("isbn") || ""),
      authorId: String(formData.get("authorId") || ""),
      designerId: String(formData.get("designerId") || ""),
      pricePaper: String(formData.get("pricePaper") || ""),
      priceEbook: String(formData.get("priceEbook") || ""),
      publishedAt: String(formData.get("publishedAt") || ""),
      language: String(formData.get("language") || ""),
      pageCount: String(formData.get("pageCount") || ""),
      description: String(formData.get("description") || ""),
    };

    startTransition(() => {
      if (editingBook) {
        updateBook({ ...payload, id: editingBook.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setBooks(result.books);
          formRef.current?.reset();
          setEditingBook(null);
          setIsModalOpen(false);
        });
      } else {
        createBook(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setBooks(result.books);
          formRef.current?.reset();
          setEditingBook(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(book: BookListItem) {
    // Put the form into edit mode with the selected book values.
    setEditingBook(book);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingBook(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleDelete(bookId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer ce livre ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteBook({ id: bookId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setBooks(result.books);
      });
    });
  }

  function handleResetFilters() {
    // Clear search and author filters.
    setSearchTerm("");
    setAuthorFilter("ALL");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Gestion des livres</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Creez et maintenez votre catalogue de livres.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBook(null);
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Creer un livre
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? "Modifier un livre" : "Creer un livre"}
            </DialogTitle>
            <DialogDescription>
              {editingBook
                ? "Mettez a jour les informations du livre."
                : "Ajoutez un nouveau livre au catalogue."}
            </DialogDescription>
          </DialogHeader>

          {!hasAuthors && (
            <p className="text-sm text-muted-foreground">
              Ajoutez d&apos;abord un auteur dans la section Auteurs pour pouvoir
              creer un livre.
            </p>
          )}
          {!hasDesigners && (
            <p className="text-xs text-muted-foreground">
              Ajoutez un designer dans la section Designers pour pouvoir le
              selectionner (optionnel).
            </p>
          )}

          <form
            key={formKey}
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Nom du livre</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingBook?.title ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (optionnel)</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  defaultValue={editingBook?.isbn ?? ""}
                  placeholder="Ex: 9780000000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorId">Auteur</Label>
                <select
                  id="authorId"
                  name="authorId"
                  defaultValue={editingBook?.authorId ?? ""}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  required
                  disabled={!hasAuthors}
                >
                  <option value="" disabled>
                    Selectionnez un auteur
                  </option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designerId">Designer (optionnel)</Label>
                <select
                  id="designerId"
                  name="designerId"
                  defaultValue={editingBook?.designerId ?? ""}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  disabled={!hasDesigners}
                >
                  <option value="">
                    {hasDesigners
                      ? "Selectionnez un designer"
                      : "Aucun designer disponible"}
                  </option>
                  {designers.map((designer) => (
                    <option key={designer.id} value={designer.id}>
                      {designer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Input
                  id="language"
                  name="language"
                  defaultValue={editingBook?.language ?? ""}
                  placeholder="Ex: Francais"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageCount">Nombre de pages</Label>
                <Input
                  id="pageCount"
                  name="pageCount"
                  type="number"
                  min={1}
                  defaultValue={editingBook?.pageCount ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedAt">Date de publication</Label>
                <Input
                  id="publishedAt"
                  name="publishedAt"
                  type="date"
                  defaultValue={formatDateInput(editingBook?.publishedAt ?? null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePaper">Prix papier</Label>
                <Input
                  id="pricePaper"
                  name="pricePaper"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={
                    editingBook ? formatPrice(editingBook.pricePaperCents) : ""
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceEbook">Prix ebook</Label>
                <Input
                  id="priceEbook"
                  name="priceEbook"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={
                    editingBook ? formatPrice(editingBook.priceEbookCents) : ""
                  }
                  required
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Editeur par defaut : {DEFAULT_PUBLISHER}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingBook?.description ?? ""}
                placeholder="Resume, points importants, etc."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending || !hasAuthors}>
                {editingBook ? "Mettre a jour" : "Creer"}
              </Button>
              {editingBook && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Livres</CardTitle>
          <CardDescription>Liste des livres existants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="book-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="book-search"
                    name="book-search"
                    placeholder="Titre, ISBN, auteur, editeur..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </InputGroup>
              </div>

              <div className="w-full md:w-56">
                <Label htmlFor="author-filter">Filtrer par auteur</Label>
                <select
                  id="author-filter"
                  name="author-filter"
                  value={authorFilter}
                  onChange={(event) => setAuthorFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">Tous les auteurs</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={handleResetFilters}
                >
                  Reinitialiser
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {filteredBooks.length} livre(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Titre</th>
                  <th className="py-2 pr-4">Auteur</th>
                  <th className="py-2 pr-4">ISBN</th>
                  <th className="py-2 pr-4">Prix papier</th>
                  <th className="py-2 pr-4">Prix ebook</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{book.title}</td>
                    <td className="py-2 pr-4">{book.authorName}</td>
                    <td className="py-2 pr-4">{book.isbn ?? "-"}</td>
                    <td className="py-2 pr-4">{formatPrice(book.pricePaperCents)}</td>
                    <td className="py-2 pr-4">{formatPrice(book.priceEbookCents)}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(book)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(book.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBooks.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun livre ne correspond a la recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
