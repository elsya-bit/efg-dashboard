export const NAV_ITEMS = [
  { slug: "overview", label: "Overview" },
  { slug: "campaigns", label: "Campaigns" },
  { slug: "budget", label: "Budget" },
  { slug: "daily-tracker", label: "Daily Tracker" },
  { slug: "ab-testing", label: "A/B Testing" },
  { slug: "actions", label: "Actions" },
  { slug: "creative", label: "Creative" },
  { slug: "reports", label: "Reports" },
] as const;

export type ScreenSlug = (typeof NAV_ITEMS)[number]["slug"];
