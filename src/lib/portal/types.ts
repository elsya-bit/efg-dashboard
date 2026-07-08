export type PortalClient = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  industry: string | null;
  objective: string | null;
  manager: string | null;
  contact: string | null;
  contact_role: string | null;
  accent_colour: string | null;
  /** Display-ready URL (storage public URL or dev fixture path), null = initials block. */
  logo_url: string | null;
  currency: string;
};

export type MonthStatus = "Draft" | "Approved" | "Published" | "Planned";

export type PortalMonth = {
  id: string;
  /** '2026-07' */
  key: string;
  /** 'July 2026' */
  label: string;
  status: MonthStatus;
  budget: number | null;
  target_cpl: number | null;
  days_in_month: number | null;
  days_elapsed: number | null;
  updated_at: string | null;
  /** true when the month carries report data (metrics present). */
  has_report: boolean;
};

export type PortalRole = "internal" | "client";

/** report_uploads row as both providers expose it. */
export type UploadRowDb = {
  id: string;
  type: "meta_dashboard" | "daily_tracker" | "ab_testing";
  /** ISO date the data runs to. */
  as_of: string;
  version: number;
  status: "Current" | "Archived";
  file_path: string | null;
  /** Original filename (fixture rows carry it directly; DB rows derive from file_path). */
  file_name: string | null;
  summary: Record<string, number>;
  prev_summary: Record<string, number> | null;
  uploaded_at: string;
};

export type PortalShell = {
  userEmail: string;
  /** The signed-in user's real role. */
  realRole: PortalRole;
  /** Role the UI renders as — 'client' when internal staff use "View as client". */
  effectiveRole: PortalRole;
  viewAsClient: boolean;
  /** Clients this login can read (RLS-constrained), ordered by name. */
  clients: PortalClient[];
  client: PortalClient;
  /**
   * Reported months visible to the effective role (clients: Published only),
   * newest first. Planned month shells are excluded here.
   */
  months: PortalMonth[];
  /** The effective month being displayed. */
  month: PortalMonth;
};
