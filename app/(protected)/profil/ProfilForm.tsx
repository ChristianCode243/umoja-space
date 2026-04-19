"use client";

import { type FormEvent, useRef, useState, useTransition } from "react";
import { changeMyPassword, updateMyProfile } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfilFormProps = {
  initialName: string;
  initialEmail: string;
};

export function ProfilForm({ initialName, initialEmail }: ProfilFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const passwordFormRef = useRef<HTMLFormElement | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(() => {
      updateMyProfile({
        name,
        email,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        setName(result.user.name);
        setEmail(result.user.email);
        setSuccess("Profil mis a jour avec succes.");
      });
    });
  }

  function handlePasswordSubmit(formData: FormData) {
    setPasswordError(null);
    setPasswordSuccess(null);

    startPasswordTransition(() => {
      changeMyPassword({
        currentPassword: String(formData.get("currentPassword") || ""),
        newPassword: String(formData.get("newPassword") || ""),
        confirmPassword: String(formData.get("confirmPassword") || ""),
      }).then((result) => {
        if (!result.ok) {
          setPasswordError(result.error);
          return;
        }

        passwordFormRef.current?.reset();
        setPasswordSuccess(result.message);
        setIsPasswordModalOpen(false);
      });
    });
  }

  return (
    <div className="space-y-4 md:max-w-xl">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isPending}>
            Enregistrer
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
            Changer le mot de passe
          </Button>
          {success && <p className="text-sm text-emerald-600">{success}</p>}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      {passwordSuccess && <p className="text-sm text-emerald-600">{passwordSuccess}</p>}

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Saisissez votre ancien mot de passe pour confirmer la modification.
            </DialogDescription>
          </DialogHeader>
          <form ref={passwordFormRef} action={handlePasswordSubmit} className="grid gap-3">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Ancien mot de passe</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required minLength={8} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isPasswordPending}>
                Mettre a jour le mot de passe
              </Button>
            </div>

            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
