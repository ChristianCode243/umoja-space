"use client";

import { useEffect } from "react";

/**
 * Global UI fallback for route rendering errors.
 * This helps users recover without a white screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground">
        L&apos;application a rencontre un probleme inattendu. Vous pouvez reessayer.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
      >
        Reessayer
      </button>
    </main>
  );
}
