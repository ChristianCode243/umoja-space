"use client";

// Client-side ambassadors management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Search, Trash2, UserCheck } from "lucide-react";
import { createAmbassador, deleteAmbassador, updateAmbassador } from "./actions";
import type { AmbassadorListItem, ClubOption } from "./types";
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

type AmbassadorsManagerProps = {
  initialAmbassadors: AmbassadorListItem[];
  clubs: ClubOption[];
};

export function AmbassadorsManager({
  initialAmbassadors,
  clubs,
}: AmbassadorsManagerProps) {
  const [ambassadors, setAmbassadors] =
    useState<AmbassadorListItem[]>(initialAmbassadors);
  const [editingAmbassador, setEditingAmbassador] =
    useState<AmbassadorListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clubFilter, setClubFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingAmbassador?.id ?? "new";
  const hasClubs = clubs.length > 0;

  // Extract unique cities for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set(ambassadors.map((a) => a.city).filter(Boolean) as string[]);
    return Array.from(cities).sort();
  }, [ambassadors]);

  // Filter ambassadors in real-time as the search term or filters change.
  const filteredAmbassadors = useMemo(() => {
    let result = ambassadors;

    if (clubFilter !== "ALL") {
      result = result.filter((ambassador) => ambassador.clubId === clubFilter);
    }

    if (cityFilter !== "ALL") {
      result = result.filter((ambassador) => ambassador.city === cityFilter);
    }

    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return result;
    }

    return result.filter((ambassador) =>
      [
        ambassador.name,
        ambassador.email,
        ambassador.phone,
        ambassador.city,
        ambassador.country,
        ambassador.bio,
        ambassador.clubName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [ambassadors, searchTerm, clubFilter, cityFilter]);

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
      clubId: String(formData.get("clubId") || ""),
      bio: String(formData.get("bio") || ""),
    };

    startTransition(() => {
      if (editingAmbassador) {
        updateAmbassador({ ...payload, id: editingAmbassador.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setAmbassadors(result.ambassadors);
          formRef.current?.reset();
          setEditingAmbassador(null);
          setIsModalOpen(false);
        });
      } else {
        createAmbassador(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setAmbassadors(result.ambassadors);
          formRef.current?.reset();
          setEditingAmbassador(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(ambassador: AmbassadorListItem) {
    // Put the form into edit mode with the selected ambassador values.
    setEditingAmbassador(ambassador);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingAmbassador(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleDelete(ambassadorId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer cet ambassadeur ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteAmbassador({ id: ambassadorId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setAmbassadors(result.ambassadors);
      });
    });
  }

  function handleResetFilters() {
    // Clear search and filters.
    setSearchTerm("");
    setClubFilter("ALL");
    setCityFilter("ALL");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Gestion des ambassadeurs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Suivez les ambassadeurs de vos clubs.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAmbassador(null);
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Creer un ambassadeur
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAmbassador ? "Modifier un ambassadeur" : "Creer un ambassadeur"}
            </DialogTitle>
            <DialogDescription>
              {editingAmbassador
                ? "Mettez a jour les informations de l'ambassadeur."
                : "Ajoutez un nouvel ambassadeur."}
            </DialogDescription>
          </DialogHeader>

          {!hasClubs && (
            <p className="text-xs text-muted-foreground">
              Ajoutez un club dans la section Clubs pour pouvoir l&apos;associer.
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
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingAmbassador?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingAmbassador?.email ?? ""}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingAmbassador?.phone ?? ""}
                  placeholder="+243..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={editingAmbassador?.city ?? ""}
                  placeholder="Ex: Kinshasa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={editingAmbassador?.country ?? ""}
                  placeholder="Ex: RDC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clubId">Club (optionnel)</Label>
                <select
                  id="clubId"
                  name="clubId"
                  defaultValue={editingAmbassador?.clubId ?? ""}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  disabled={!hasClubs}
                >
                  <option value="">
                    {hasClubs
                      ? "Selectionnez un club"
                      : "Aucun club disponible"}
                  </option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Notes</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={editingAmbassador?.bio ?? ""}
                placeholder="Zone, responsabilites, disponibilite..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending}>
                {editingAmbassador ? "Mettre a jour" : "Creer"}
              </Button>
              {editingAmbassador && (
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
          <CardTitle>Ambassadeurs</CardTitle>
          <CardDescription>Liste des ambassadeurs existants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="ambassador-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="ambassador-search"
                    name="ambassador-search"
                    placeholder="Nom, email, ville, club..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </InputGroup>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="club-filter">Filtrer par club</Label>
                <select
                  id="club-filter"
                  name="club-filter"
                  value={clubFilter}
                  onChange={(event) => setClubFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  disabled={!hasClubs}
                >
                  <option value="ALL">Tous les clubs</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
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
              {filteredAmbassadors.length} ambassadeur(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Club</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Telephone</th>
                  <th className="py-2 pr-4">Pays</th>
                  <th className="py-2 pr-4">Cree le</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmbassadors.map((ambassador) => (
                  <tr key={ambassador.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{ambassador.name}</td>
                    <td className="py-2 pr-4">
                      {ambassador.clubName ?? "-"}
                    </td>
                    <td className="py-2 pr-4">{ambassador.email ?? "-"}</td>
                    <td className="py-2 pr-4">{ambassador.phone ?? "-"}</td>
                    <td className="py-2 pr-4">{ambassador.country ?? "-"}</td>
                    <td className="py-2 pr-4">
                      {new Date(ambassador.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ambassador)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ambassador.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAmbassadors.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun ambassadeur ne correspond a la recherche.
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
