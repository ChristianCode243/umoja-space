"use client";

// Client-side users management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Search, Trash2, Users } from "lucide-react";
import { createUser, deleteUser, updateUser } from "./actions";
import {
  USER_PROFILES,
  type UserProfileOption,
} from "./constants";
import type { UserListItem } from "./types";
import type { ClubOption } from "@/app/(protected)/clubs/types";
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

type UsersManagerProps = {
  initialUsers: UserListItem[];
  currentUserEmail: string;
  clubs: ClubOption[];
};

type ProfileFilter = "ALL" | UserProfileOption;

export function UsersManager({
  initialUsers,
  currentUserEmail,
  clubs,
}: UsersManagerProps) {
  const [users, setUsers] = useState<UserListItem[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>("ALL");
  const [selectedProfile, setSelectedProfile] = useState<UserProfileOption>("AUTEUR");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingUser?.id ?? "new";

  // Filter users in real-time as the search term or role filter changes.
  const filteredUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    let result = users;

    if (profileFilter !== "ALL") {
      result = result.filter((user) => user.profile === profileFilter);
    }

    if (profileFilter !== "ALL") {
      result = result.filter((user) => user.profile === profileFilter);
    }

    if (!normalized) {
      return result;
    }

    return result.filter((user) =>
      [user.name, user.email, user.profile, user.clubScopeName]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [users, searchTerm, profileFilter]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      profile: String(formData.get("profile") || "AUTEUR"),
      clubScopeId: String(formData.get("clubScopeId") || ""),
      password: String(formData.get("password") || ""),
    };

    startTransition(() => {
      if (editingUser) {
        updateUser({ ...payload, id: editingUser.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setUsers(result.users);
          formRef.current?.reset();
          setEditingUser(null);
          setIsModalOpen(false);
        });
      } else {
        createUser(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setUsers(result.users);
          formRef.current?.reset();
          setEditingUser(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(user: UserListItem) {
    // Put the form into edit mode with the selected user values.
    setEditingUser(user);
    setSelectedProfile(user.profile);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingUser(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleOpenCreateModal() {
    setEditingUser(null);
    setSelectedProfile("AUTEUR");
    setError(null);
    setIsModalOpen(true);
  }

  function handleDelete(userId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer cet utilisateur ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteUser({ id: userId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setUsers(result.users);
      });
    });
  }

  function handleResetFilters() {
    // Clear search and role filters.
    setSearchTerm("");
    setProfileFilter("ALL");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Gestion des utilisateurs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Connecte en tant que {currentUserEmail}
          </p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Modifier un utilisateur" : "Créer un utilisateur"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Mettez à jour les informations et rôles."
                : "Ajoutez un nouvel utilisateur avec un mot de passe sécurisé."}
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
                  defaultValue={editingUser?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email ?? ""}
                  required
                />
              </div>

                            <div className="space-y-2">
                <Label htmlFor="profile">Profil</Label>
                <select
                  id="profile"
                  name="profile"
                  value={selectedProfile}
                  onChange={(event) =>
                    setSelectedProfile(event.target.value as UserProfileOption)
                  }
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {USER_PROFILES.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedProfile === "CHEF_CLUB" || selectedProfile === "AMBASSADEUR") && (
                <div className="space-y-2">
                  <Label htmlFor="clubScopeId">Club de responsabilite</Label>
                  <select
                    id="clubScopeId"
                    name="clubScopeId"
                    defaultValue={editingUser?.clubScopeId ?? ""}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    required
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
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? "Nouveau mot de passe" : "Mot de passe"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={
                    editingUser
                      ? "Laisser vide pour ne pas changer"
                      : "Au moins 8 caractères"
                  }
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {editingUser ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Liste des comptes existants.</CardDescription>
          </div>
          <Button onClick={handleOpenCreateModal}>Créer un utilisateur</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="user-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="user-search"
                    name="user-search"
                    placeholder="Nom, email ou profil"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </InputGroup>
              </div>

                            <div className="w-full md:w-56">
                <Label htmlFor="profile-filter">Filtrer par profil</Label>
                <select
                  id="profile-filter"
                  name="profile-filter"
                  value={profileFilter}
                  onChange={(event) =>
                    setProfileFilter(event.target.value as ProfileFilter)
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">Tous les profils</option>
                  {USER_PROFILES.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-56">
                <Label htmlFor="profile-filter">Filtrer par profil</Label>
                <select
                  id="profile-filter"
                  name="profile-filter"
                  value={profileFilter}
                  onChange={(event) =>
                    setProfileFilter(event.target.value as ProfileFilter)
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">Tous les profils</option>
                  {USER_PROFILES.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
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
              {filteredUsers.length} utilisateur(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Profil</th>
                  <th className="py-2 pr-4">Club scope</th>
                  <th className="py-2 pr-4">Cree le</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{user.name}</td>
                    <td className="py-2 pr-4">{user.email}</td>
                    <td className="py-2 pr-4">{user.profile}</td>
                    <td className="py-2 pr-4">{user.clubScopeName ?? "-"}</td>
                    <td className="py-2 pr-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun utilisateur ne correspond a la recherche.
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
