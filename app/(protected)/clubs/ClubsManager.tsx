"use client";

// Client-side clubs management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Search, Trash2, UsersRound } from "lucide-react";
import { createClub, deleteClub, updateClub } from "./actions";
import type { ClubListItem } from "./types";
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

type ClubsManagerProps = {
  initialClubs: ClubListItem[];
};

function formatDateInput(value: string | null): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

export function ClubsManager({ initialClubs }: ClubsManagerProps) {
  const [clubs, setClubs] = useState<ClubListItem[]>(initialClubs);
  const [editingClub, setEditingClub] = useState<ClubListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingClub?.id ?? "new";

  // Extract unique countries and cities for filters
  const uniqueCountries = useMemo(() => {
    const countries = new Set(clubs.map((c) => c.country).filter(Boolean) as string[]);
    return Array.from(countries).sort();
  }, [clubs]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(clubs.map((c) => c.city).filter(Boolean) as string[]);
    return Array.from(cities).sort();
  }, [clubs]);

  // Filter clubs in real-time as the search term or filters change.
  const filteredClubs = useMemo(() => {
    let result = clubs;

    if (countryFilter !== "ALL") {
      result = result.filter((club) => club.country === countryFilter);
    }
    
    if (cityFilter !== "ALL") {
      result = result.filter((club) => club.city === cityFilter);
    }

    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return result;
    }

    return result.filter((club) =>
      [
        club.name,
        club.email,
        club.phone,
        club.city,
        club.country,
        club.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [clubs, searchTerm, countryFilter, cityFilter]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      city: String(formData.get("city") || ""),
      country: String(formData.get("country") || ""),
      foundedAt: String(formData.get("foundedAt") || ""),
      description: String(formData.get("description") || ""),
    };

    startTransition(() => {
      if (editingClub) {
        updateClub({ ...payload, id: editingClub.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setClubs(result.clubs);
          formRef.current?.reset();
          setEditingClub(null);
          setIsModalOpen(false);
        });
      } else {
        createClub(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setClubs(result.clubs);
          formRef.current?.reset();
          setEditingClub(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(club: ClubListItem) {
    // Put the form into edit mode with the selected club values.
    setEditingClub(club);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingClub(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleDelete(clubId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer ce club ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteClub({ id: clubId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setClubs(result.clubs);
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
            <UsersRound className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Gestion des clubs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Creez, mettez a jour et suivez vos clubs.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClub(null);
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Créer un club
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClub ? "Modifier un club" : "Créer un club"}
            </DialogTitle>
            <DialogDescription>
              {editingClub
                ? "Mettez à jour les informations du club."
                : "Ajoutez un nouveau club à la communauté."}
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
                <Label htmlFor="name">Nom du club</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingClub?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingClub?.email ?? ""}
                  placeholder="club@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingClub?.phone ?? ""}
                  placeholder="+243..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={editingClub?.city ?? ""}
                  placeholder="Ex: Kinshasa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={editingClub?.country ?? ""}
                  placeholder="Ex: RDC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedAt">Date de creation</Label>
                <Input
                  id="foundedAt"
                  name="foundedAt"
                  type="date"
                  defaultValue={formatDateInput(editingClub?.foundedAt ?? null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingClub?.description ?? ""}
                placeholder="Mission, activites, objectifs..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending}>
                {editingClub ? "Mettre à jour" : "Créer"}
              </Button>
              {editingClub && (
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
          <CardTitle>Clubs</CardTitle>
          <CardDescription>Liste des clubs existants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="club-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="club-search"
                    name="club-search"
                    placeholder="Nom, ville, pays, email..."
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
              {filteredClubs.length} club(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Ville</th>
                  <th className="py-2 pr-4">Pays</th>
                  <th className="py-2 pr-4">Ambassadeurs</th>
                  <th className="py-2 pr-4">Membres</th>
                  <th className="py-2 pr-4">Cree le</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{club.name}</td>
                    <td className="py-2 pr-4">{club.city ?? "-"}</td>
                    <td className="py-2 pr-4">{club.country ?? "-"}</td>
                    <td className="py-2 pr-4">{club.ambassadorsCount}</td>
                    <td className="py-2 pr-4">{club.membersCount}</td>
                    <td className="py-2 pr-4">
                      {new Date(club.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(club)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(club.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClubs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun club ne correspond a la recherche.
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
