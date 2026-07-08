/**
 * Dev-only fixture mode: render the portal from the design-handoff dataset
 * with auth bypassed. The single source of truth for this check — imported
 * by both the request proxy (auth bypass) and the data providers, so the
 * two can never disagree.
 *
 * Gated on NODE_ENV === 'development' (fail closed): `next start`, staging,
 * test, and unset NODE_ENV all refuse fixtures even if the env var leaks in.
 */
export function fixturesEnabled(): boolean {
  return (
    process.env.EFG_DEV_FIXTURES === "1" &&
    process.env.NODE_ENV === "development"
  );
}
