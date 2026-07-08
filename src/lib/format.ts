/**
 * Formatting rules ported verbatim from the prototype (handoff README):
 * actual spend amounts always show 2 decimals; planned budgets and
 * forecasts show whole dollars; en-AU separators; AUD.
 */

/** Whole-dollar amounts: planned budgets, forecasts. e.g. $25,575 */
export function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-AU");
}

/** Actual spend amounts, always 2 decimals. e.g. $3,629.06 */
export function money2(n: number): string {
  return (
    "$" +
    Number(n).toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** '2026-07' → 'July 2026' */
export function monthName(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

/** '2026-07' → '2026-08' */
export function nextMonthKey(key: string): string {
  let y = parseInt(key.split("-")[0], 10);
  let m = parseInt(key.split("-")[1], 10) + 1;
  if (m > 12) {
    m = 1;
    y++;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** '2026-07-01' (date) → '2026-07' (month key) */
export function toMonthKey(date: string): string {
  return String(date).slice(0, 7);
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** '2026-07-05' → '5 Jul 2026' (prototype fmtIso) */
export function fmtIso(iso: string | null | undefined): string {
  if (!iso) return "";
  const p = String(iso).split("-");
  return `${parseInt(p[2], 10)} ${SHORT_MONTHS[parseInt(p[1], 10) - 1]} ${p[0]}`;
}

/**
 * timestamptz → '5 Jul 2026, 9:12am' in Australia/Sydney.
 * Composed from parts because some ICU builds expand en-AU short months
 * (e.g. 'July' instead of 'Jul').
 */
export function fmtUpdated(ts: string | null | undefined): string {
  if (!ts) return "";
  const parts = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Sydney",
  }).formatToParts(new Date(ts));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const month = SHORT_MONTHS[parseInt(get("month"), 10) - 1];
  const ampm = get("dayPeriod").replace(/\./g, "").toLowerCase();
  // parseInt strips the zero-padding some ICU builds add to day/hour.
  return `${parseInt(get("day"), 10)} ${month} ${get("year")}, ${parseInt(get("hour"), 10)}:${get("minute")}${ampm}`;
}
