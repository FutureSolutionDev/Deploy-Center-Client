/**
 * Write-only secrets (server v3.0.1, SEC-H3).
 *
 * The API never returns secret values. It sends SECRET_MASK in their place and
 * keeps the stored value when the mask is sent back unchanged, so forms can
 * round-trip it safely. `Secrets` on a project reports { HasValue } per path.
 */

export const SECRET_MASK = "********";

export interface ISecretState {
  HasValue: boolean;
}

export const IsMaskedSecret = (value: unknown): boolean => value === SECRET_MASK;

export const HasSecret = (
  secrets: Record<string, ISecretState> | undefined,
  path: string,
  fallback?: unknown
): boolean => {
  const state = secrets?.[path];
  if (state) return state.HasValue;
  return typeof fallback === "string" ? fallback.length > 0 : Boolean(fallback);
};
