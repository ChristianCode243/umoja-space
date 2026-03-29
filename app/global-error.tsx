"use client";

/**
 * Last-resort error boundary for fatal app-level crashes.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app/global-error]", error);

  return (
    <html>
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold">Erreur critique</h1>
          <p className="text-sm text-muted-foreground">
            Une erreur critique est survenue. Merci de recharger la page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            Reessayer
          </button>
        </main>
      </body>
    </html>
  );
}
