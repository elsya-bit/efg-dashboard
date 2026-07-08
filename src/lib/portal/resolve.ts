import type { PortalMonth, PortalRole } from "./types";

/**
 * The prototype's `effectiveMonthKey` rule:
 * - only reported months are selectable;
 * - if the requested month has no report, fall back to the latest reported;
 * - if the effective role is client and that month isn't Published, fall
 *   back to the latest Published month.
 *
 * `months` must be ALL reported months for the client, newest first.
 * Returns null when nothing is visible to the effective role.
 */
export function visibleMonths(
  months: PortalMonth[],
  effectiveRole: PortalRole,
): PortalMonth[] {
  const reported = months.filter((m) => m.has_report);
  return effectiveRole === "client"
    ? reported.filter((m) => m.status === "Published")
    : reported;
}

export function resolveEffectiveMonth(
  months: PortalMonth[],
  effectiveRole: PortalRole,
  requestedKey: string | null,
): PortalMonth | null {
  const visible = visibleMonths(months, effectiveRole);
  if (visible.length === 0) return null;
  return visible.find((m) => m.key === requestedKey) ?? visible[0];
}
