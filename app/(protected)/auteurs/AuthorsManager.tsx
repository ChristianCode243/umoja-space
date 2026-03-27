"use client";

// Client-side authors management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Search, Trash2, UserPen } from "lucide-react";
import { createAuthor, deleteAuthor, updateAuthor } from "./actions";
import type { AuthorListItem } from "./types";
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

type AuthorsManagerProps = {
  initialAuthors: AuthorListItem[];
};

export function AuthorsManager({ initialAuthors }: AuthorsManagerProps) {
  const [authors, setAuthors] = useState<AuthorListItem[]>(initialAuthors);
  const [editingAuthor, setEditingAuthor] = useState<AuthorListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingAuthor?.id ?? "new";

  // Extract unique countries and cities for filters
  const uniqueCountries = useMemo(() => {
    const countries = new Set(authors.map((a) => a.country).filter(Boolean) as string[]);
    return Array.from(countries).sort();
  }, [authors]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(authors.map((a) => a.city).filter(Boolean) as string[]);
    return Array.from(cities).sort();
  }, [authors]);

  // Filter authors in real-time as the search term or filters change.
  const filteredAuthors = useMemo(() => {
    let result = authors;

    if (countryFilter !== "ALL") {
      result = result.filter((author) => author.country === countryFilter);
    }
    
    if (cityFilter !== "ALL") {
      result = result.filter((author) => author.city === cityFilter);
    }

    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return result;
    }

    return result.filter((author) =>
      [author.name, author.email, author.country, author.city, author.website, author.bio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [authors, searchTerm, countryFilter, cityFilter]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      website: String(formData.get("website") || ""),
      city: String(formData.get("city") || ""),
      country: String(formData.get("country") || ""),
      bio: String(formData.get("bio") || ""),
    };

    startTransition(() => {
      if (editingAuthor) {
        updateAuthor({ ...payload, id: editingAuthor.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setAuthors(result.authors);
          formRef.current?.reset();
          setEditingAuthor(null);
          setIsModalOpen(false);
        });
      } else {
        createAuthor(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setAuthors(result.authors);
          formRef.current?.reset();
          setEditingAuthor(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(author: AuthorListItem) {
    // Put the form into edit mode with the selected author values.
    setEditingAuthor(author);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingAuthor(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleDelete(authorId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer cet auteur ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteAuthor({ id: authorId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setAuthors(result.authors);
      });
    });
  }

  function handleResetFilters() {
    // Clear search and filters.
    setSearchTerm("");
    setCountryFilter("ALL");
    setCityFilter("ALL");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserPen className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Gestion des auteurs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ajoutez, modifiez ou supprimez des auteurs.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAuthor(null);
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Créer un auteur
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? "Modifier un auteur" : "Créer un auteur"}
            </DialogTitle>
            <DialogDescription>
              {editingAuthor
                ? "Mettez à jour les informations de l'auteur."
                : "Ajoutez un nouvel auteur au catalogue."}
            </DialogDescription>
          </DialogHeader>
          <form
            key={formKey}
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingAuthor?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingAuthor?.email ?? ""}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  name="website"
                  defaultValue={editingAuthor?.website ?? ""}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={editingAuthor?.city ?? ""}
                  placeholder="Ex: Kinshasa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={editingAuthor?.country ?? ""}
                  placeholder="Ex: RDC"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={editingAuthor?.bio ?? ""}
                placeholder="Quelques lignes sur l'auteur..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending}>
                {editingAuthor ? "Mettre à jour" : "Créer"}
              </Button>
              {editingAuthor && (
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
          <CardTitle>Auteurs</CardTitle>
          <CardDescription>Liste des auteurs existants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="author-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="author-search"
                    name="author-search"
                    placeholder="Nom, email, ville, pays, site..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </InputGroup>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="country-filter">Filtrer par pays</Label>
                <select
                  id="country-filter"
                  name="country-filter"
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">Tous les pays</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="city-filter">Filtrer par ville</Label>
                <select
                  id="city-filter"
                  name="city-filter"
                  value={cityFilter}
                  onChange={(event) => setCityFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">Toutes les villes</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
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
              {filteredAuthors.length} auteur(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Ville</th>
                  <th className="py-2 pr-4">Pays</th>
                  <th className="py-2 pr-4">Livres</th>
                  <th className="py-2 pr-4">Cree le</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuthors.map((author) => (
                  <tr key={author.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{author.name}</td>
                    <td className="py-2 pr-4">{author.email ?? "-"}</td>
                    <td className="py-2 pr-4">{author.city ?? "-"}</td>
                    <td className="py-2 pr-4">{author.country ?? "-"}</td>
                    <td className="py-2 pr-4">{author.booksCount}</td>
                    <td className="py-2 pr-4">
                      {new Date(author.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(author)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(author.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAuthors.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun auteur ne correspond a la recherche.
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
