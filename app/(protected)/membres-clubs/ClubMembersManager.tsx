"use client";

// Client-side club members management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Search, Trash2, Users } from "lucide-react";
import { createClubMember, deleteClubMember, updateClubMember } from "./actions";
import type { ClubMemberListItem, ClubOption } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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

type ClubMembersManagerProps = {
  initialMembers: ClubMemberListItem[];
  clubs: ClubOption[];
  showClubCityFilters?: boolean;
};

type ClubFilter = "ALL" | string;

function formatDateInput(value: string | null): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

export function ClubMembersManager({
  initialMembers,
  clubs,
  showClubCityFilters = true,
}: ClubMembersManagerProps) {
  const [members, setMembers] = useState<ClubMemberListItem[]>(initialMembers);
  const [editingMember, setEditingMember] =
    useState<ClubMemberListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clubFilter, setClubFilter] = useState<ClubFilter>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingMember?.id ?? "new";
  const hasClubs = clubs.length > 0;
  const lockedClubId = clubs.length === 1 ? clubs[0].id : "";

  // Extract unique cities for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set(members.map((m) => m.city).filter(Boolean) as string[]);
    return Array.from(cities).sort();
  }, [members]);

  // Filter members in real-time as the search term or club filter changes.
  const filteredMembers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    let result = members;

    if (showClubCityFilters && clubFilter !== "ALL") {
      result = result.filter((member) => member.clubId === clubFilter);
    }

    if (showClubCityFilters && cityFilter !== "ALL") {
      result = result.filter((member) => member.city === cityFilter);
    }

    if (!normalized) {
      return result;
    }

    return result.filter((member) =>
      [
        member.name,
        member.email,
        member.phone,
        member.city,
        member.status,
        member.clubName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [members, searchTerm, clubFilter, cityFilter, showClubCityFilters]);

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
      status: String(formData.get("status") || ""),
      joinedAt: String(formData.get("joinedAt") || ""),
      clubId: String(formData.get("clubId") || lockedClubId),
    };

    startTransition(() => {
      if (editingMember) {
        updateClubMember({ ...payload, id: editingMember.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setMembers(result.members);
          formRef.current?.reset();
          setEditingMember(null);
          setIsModalOpen(false);
        });
      } else {
        createClubMember(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setMembers(result.members);
          formRef.current?.reset();
          setEditingMember(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(member: ClubMemberListItem) {
    // Put the form into edit mode with the selected member values.
    setEditingMember(member);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingMember(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleDelete(memberId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer ce membre ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteClubMember({ id: memberId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMembers(result.members);
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
            <Users className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">
              Gestion des membres des clubs
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ajoutez et suivez les membres de vos clubs.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMember(null);
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Creer un membre
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Modifier un membre" : "Creer un membre"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Mettez a jour les informations du membre."
                : "Ajoutez un nouveau membre a un club."}
            </DialogDescription>
          </DialogHeader>

          {!hasClubs && (
            <p className="text-sm text-muted-foreground">
              Ajoutez d&apos;abord un club dans la section Clubs.
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
                  defaultValue={editingMember?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Club</Label>
                {lockedClubId ? (
                  <>
                    <Input value={clubs[0].name} disabled />
                    <input type="hidden" name="clubId" value={editingMember?.clubId ?? lockedClubId} />
                  </>
                ) : (
                  <select
                    id="clubId"
                    name="clubId"
                    defaultValue={editingMember?.clubId ?? ""}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    required
                    disabled={!hasClubs}
                  >
                    <option value="" disabled>
                      Selectionnez un club
                    </option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Input
                  id="status"
                  name="status"
                  defaultValue={editingMember?.status ?? ""}
                  placeholder="Ex: Actif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingMember?.email ?? ""}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingMember?.phone ?? ""}
                  placeholder="+243..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={editingMember?.city ?? ""}
                  placeholder="Ex: Kinshasa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinedAt">Date d&apos;adhesion</Label>
                <Input
                  id="joinedAt"
                  name="joinedAt"
                  type="date"
                  defaultValue={formatDateInput(editingMember?.joinedAt ?? null)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending || !hasClubs}>
                {editingMember ? "Mettre a jour" : "Creer"}
              </Button>
              {editingMember && (
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
          <CardTitle>Membres</CardTitle>
          <CardDescription>Liste des membres existants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="member-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="member-search"
                    name="member-search"
                    placeholder="Nom, role, ville, club, email..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </InputGroup>
              </div>

              {showClubCityFilters && (
                <>
                  <div className="w-full md:w-48">
                    <Label htmlFor="club-filter">Filtrer par club</Label>
                    <select
                      id="club-filter"
                      name="club-filter"
                      value={clubFilter}
                      onChange={(event) => setClubFilter(event.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
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
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {filteredMembers.length} membre(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Club</th>
                  <th className="py-2 pr-4">Ville</th>
                  <th className="py-2 pr-4">Statut</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Telephone</th>
                  <th className="py-2 pr-4">Adhesion</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{member.name}</td>
                    <td className="py-2 pr-4">{member.clubName}</td>
                    <td className="py-2 pr-4">{member.city ?? "-"}</td>
                    <td className="py-2 pr-4">{member.status ?? "-"}</td>
                    <td className="py-2 pr-4">{member.email ?? "-"}</td>
                    <td className="py-2 pr-4">{member.phone ?? "-"}</td>
                    <td className="py-2 pr-4">
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun membre ne correspond a la recherche.
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
