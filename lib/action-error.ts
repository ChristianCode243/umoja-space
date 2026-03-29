/**
 * Shared server-action error tools.
 *
 * Goal:
 * - keep user-facing messages consistent
 * - log technical details only on server side
 */
export function logServerError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}

/**
 * Build a safe `{ ok: false, error }` payload for server actions.
 */
export function actionError<T>(
  context: string,
  error: unknown,
  message = "Une erreur serveur est survenue."
): T {
  logServerError(context, error);
  return {
    ok: false,
    error: message,
  } as T;
}
