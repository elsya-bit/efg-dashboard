/** Row of small stat cards (Daily Tracker / A/B Testing screens). */
export function StatCards({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex min-w-[150px] flex-1 flex-col gap-[3px] rounded-[14px] border border-line bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(22,46,39,.05)]"
        >
          <span className="text-[11.5px] text-muted">{s.label}</span>
          <span className="font-heading text-lg font-semibold">{s.value}</span>
        </div>
      ))}
    </div>
  );
}
