"use client";

// Client-side designers management with server actions for CRUD.
import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Search, Trash2, Palette } from "lucide-react";
import { createDesigner, deleteDesigner, updateDesigner } from "./actions";
import type { DesignerListItem } from "./types";
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

type DesignersManagerProps = {
  initialDesigners: DesignerListItem[];
};

export function DesignersManager({ initialDesigners }: DesignersManagerProps) {
  const [designers, setDesigners] = useState<DesignerListItem[]>(initialDesigners);
  const [editingDesigner, setEditingDesigner] = useState<DesignerListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const formKey = editingDesigner?.id ?? "new";

  // Extract unique specialties and countries for filters
  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set(designers.map((d) => d.specialty).filter(Boolean) as string[]);
    return Array.from(specialties).sort();
  }, [designers]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(designers.map((d) => d.country).filter(Boolean) as string[]);
    return Array.from(countries).sort();
  }, [designers]);

  // Filter designers in real-time as the search term or filters change.
  const filteredDesigners = useMemo(() => {
    let result = designers;

    if (specialtyFilter !== "ALL") {
      result = result.filter((designer) => designer.specialty === specialtyFilter);
    }
    
    if (countryFilter !== "ALL") {
      result = result.filter((designer) => designer.country === countryFilter);
    }

    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return result;
    }

    return result.filter((designer) =>
      [
        designer.name,
        designer.email,
        designer.phone,
        designer.specialty,
        designer.portfolioUrl,
        designer.country,
        designer.bio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [designers, searchTerm, specialtyFilter, countryFilter]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      specialty: String(formData.get("specialty") || ""),
      portfolioUrl: String(formData.get("portfolioUrl") || ""),
      country: String(formData.get("country") || ""),
      bio: String(formData.get("bio") || ""),
    };

    startTransition(() => {
      if (editingDesigner) {
        updateDesigner({ ...payload, id: editingDesigner.id }).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setDesigners(result.designers);
          formRef.current?.reset();
          setEditingDesigner(null);
          setIsModalOpen(false);
        });
      } else {
        createDesigner(payload).then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setDesigners(result.designers);
          formRef.current?.reset();
          setEditingDesigner(null);
          setIsModalOpen(false);
        });
      }
    });
  }

  function handleEdit(designer: DesignerListItem) {
    // Put the form into edit mode with the selected designer values.
    setEditingDesigner(designer);
    setError(null);
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingDesigner(null);
    setError(null);
    setIsModalOpen(false);
  }

  function handleDelete(designerId: string) {
    // Confirm destructive actions on the client.
    if (!window.confirm("Supprimer ce designer ?")) {
      return;
    }

    setError(null);
    startTransition(() => {
      deleteDesigner({ id: designerId }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDesigners(result.designers);
      });
    });
  }

  function handleResetFilters() {
    // Clear search and filters.
    setSearchTerm("");
    setSpecialtyFilter("ALL");
    setCountryFilter("ALL");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Gestion des designers</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ajoutez, modifiez ou supprimez des designers.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDesigner(null);
            setError(null);
            setIsModalOpen(true);
          }}
        >
          Créer un designer
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDesigner ? "Modifier un designer" : "Créer un designer"}
            </DialogTitle>
            <DialogDescription>
              {editingDesigner
                ? "Mettez à jour les informations du designer."
                : "Ajoutez un nouveau designer à l'équipe."}
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
                  defaultValue={editingDesigner?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingDesigner?.email ?? ""}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingDesigner?.phone ?? ""}
                  placeholder="+243..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialite</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  defaultValue={editingDesigner?.specialty ?? ""}
                  placeholder="Mise en page, couverture..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio</Label>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  defaultValue={editingDesigner?.portfolioUrl ?? ""}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={editingDesigner?.country ?? ""}
                  placeholder="Ex: RDC"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Notes</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={editingDesigner?.bio ?? ""}
                placeholder="Informations utiles, disponibilite, etc."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending}>
                {editingDesigner ? "Mettre à jour" : "Créer"}
              </Button>
              {editingDesigner && (
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
          <CardTitle>Designers</CardTitle>
          <CardDescription>Liste des designers existants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:flex-1">
                <Label htmlFor="designer-search">Recherche</Label>
                <InputGroup className="mt-1 h-10 w-full bg-muted/30 shadow-sm">
                  <InputGroupAddon className="text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="designer-search"
                    name="designer-search"
                    placeholder="Nom, specialite, email..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </InputGroup>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="specialty-filter">Filtrer par specialite</Label>
                <select
                  id="specialty-filter"
                  name="specialty-filter"
                  value={specialtyFilter}
                  onChange={(event) => setSpecialtyFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">Toutes les specialites</option>
                  {uniqueSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
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
              {filteredDesigners.length} designer(s)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Specialite</th>
                  <th className="py-2 pr-4">Pays</th>
                  <th className="py-2 pr-4">Cree le</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesigners.map((designer) => (
                  <tr key={designer.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{designer.name}</td>
                    <td className="py-2 pr-4">{designer.email ?? "-"}</td>
                    <td className="py-2 pr-4">{designer.specialty ?? "-"}</td>
                    <td className="py-2 pr-4">{designer.country ?? "-"}</td>
                    <td className="py-2 pr-4">
                      {new Date(designer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(designer)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(designer.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDesigners.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun designer ne correspond a la recherche.
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
