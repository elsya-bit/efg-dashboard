import { PriorityChip } from "@/components/chips";
import type {
  ReportAttention,
  ReportChanged,
  ReportNote,
  ReportWorking,
} from "@/lib/portal/report-types";

/** Needs attention / Working well two-column row. */
export function AttentionWorking({
  attention,
  working,
}: {
  attention: ReportAttention[];
  working: ReportWorking[];
}) {
  return (
    <div className="flex items-stretch gap-[18px] max-[960px]:flex-col">
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="pl-0.5 font-heading text-[15.5px] font-semibold">
          Needs attention
        </div>
        {attention.map((a) => (
          <div
            key={a.issue}
            className="flex flex-col gap-2 rounded-[14px] border border-line bg-white px-[18px] py-4 shadow-[0_1px_2px_rgba(22,46,39,.05)]"
          >
            <div className="flex items-start gap-2.5">
              <div className="flex-1 font-heading text-sm font-semibold leading-[1.4] [text-wrap:pretty]">
                {a.issue}
              </div>
              <PriorityChip priority={a.priority} />
            </div>
            <div className="text-[13px] leading-normal text-muted">{a.impact}</div>
            <div className="rounded-[9px] bg-soft px-3 py-2 text-[13px] leading-normal text-ink">
              <strong className="text-primary">Next step.</strong> {a.step}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="pl-0.5 font-heading text-[15.5px] font-semibold">
          Working well
        </div>
        {working.map((w) => (
          <div
            key={w.title}
            className="flex flex-col gap-1 rounded-[14px] border border-line bg-soft px-[18px] py-3.5"
          >
            <div className="font-heading text-sm font-semibold text-primary">
              {w.title}
            </div>
            <div className="text-[13px] leading-normal text-muted">{w.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "What changed since the last update" card. */
export function ChangedCard({ changed }: { changed: ReportChanged[] }) {
  if (changed.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="mb-2 font-heading text-[15.5px] font-semibold">
        What changed since the last update
      </div>
      {changed.map((ch) => (
        <div
          key={ch.area + ch.chip}
          className="flex items-center gap-3.5 border-t border-soft px-0.5 py-[9px]"
        >
          <span className="w-[86px] flex-none font-heading text-xs font-semibold text-primary">
            {ch.area}
          </span>
          <span className="flex-none rounded-full bg-soft px-[9px] py-0.5 font-heading text-[11px] font-semibold text-primary">
            {ch.chip}
          </span>
          <span className="text-[13.5px] leading-[1.45] text-muted">{ch.detail}</span>
        </div>
      ))}
    </div>
  );
}

/** Notes and assumptions; internal users also see internal-only notes tagged. */
export function NotesCard({
  notes,
  internalView,
}: {
  notes: ReportNote[];
  internalView: boolean;
}) {
  const visible = notes.filter((n) => internalView || n.visible);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="font-heading text-[15.5px] font-semibold">
        Notes and assumptions
      </div>
      {visible.map((n) => (
        <div key={n.id ?? n.text} className="flex items-start gap-2.5">
          <span className="mt-1.5 h-[7px] w-[7px] flex-none rounded-full bg-accent" />
          <span className="flex-1 text-[13.5px] leading-[1.55] text-ink">
            {n.text}
          </span>
          {!n.visible && (
            <span className="flex-none rounded-full bg-ink px-2 py-0.5 font-heading text-[10.5px] font-semibold text-line">
              Internal only
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
