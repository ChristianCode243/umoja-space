"use client";

import { useState, useTransition } from "react";
import { updateMyProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfilFormProps = {
  initialName: string;
  initialEmail: string;
};

export function ProfilForm({ initialName, initialEmail }: ProfilFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(() => {
      updateMyProfile({
        name,
        email,
        newPassword,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        setName(result.user.name);
        setEmail(result.user.email);
        setNewPassword("");
        setSuccess("Profil mis a jour avec succes.");
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4 md:max-w-xl">
      <div className="space-y-1">
        <Label htmlFor="profile-name">Nom</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="profile-password">Nouveau mot de passe (optionnel)</Label>
        <Input
          id="profile-password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={8}
          placeholder="Laisser vide pour ne pas changer"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          Enregistrer
        </Button>
        {success && <p className="text-sm text-emerald-600">{success}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
