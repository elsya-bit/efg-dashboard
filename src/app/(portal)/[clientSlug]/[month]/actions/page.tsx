import { getScreenData } from "@/lib/portal";
import { deriveActionColumns } from "@/lib/portal/derive";
import { Chip, PriorityChip } from "@/components/chips";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { ActionToggle } from "@/components/screens/action-toggle";

const HEAD_STYLES = {
  danger: "border-danger bg-white text-danger",
  soft: "border-line bg-soft text-primary",
  watchline: "border-line bg-white text-muted",
  solid: "border-primary bg-primary text-white",
} as const;

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null;
  const { shell, report } = result;
  const internalView = shell.effectiveRole === "internal";
  const columns = deriveActionColumns(report, internalView);

  return (
    <>
      <PageHeader
        title="Action plan"
        subtitle='Prepared by your EFG team from this month&apos;s results, and reviewed before it reaches you. Actions marked "You" need something from your side.'
      />
      <div className="grid grid-cols-4 items-start gap-3.5 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
        {columns.map((col) => (
          <div key={col.key} className="flex min-w-0 flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Chip className={HEAD_STYLES[col.headStyle]}>{col.label}</Chip>
              <span className="text-xs text-muted">{col.count}</span>
            </div>
            {col.items.map((it) => (
              <div
                key={it.id}
                className={`flex flex-col gap-2 rounded-[14px] border p-[15px] pt-3.5 shadow-[0_1px_2px_rgba(22,46,39,.05)] ${
                  it.status === "urgent" ? "border-danger" : "border-line"
                } ${it.keep ? "bg-white" : "bg-page opacity-55"}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 font-heading text-[13.5px] font-semibold leading-[1.4] [text-wrap:pretty]">
                    {it.title}
                  </div>
                  <PriorityChip priority={it.priority} />
                </div>
                <div className="text-[12.5px] leading-normal text-muted">{it.why}</div>
                <div className="rounded-lg bg-soft px-2.5 py-1.5 text-xs leading-[1.45] text-primary">
                  <strong>Expected impact.</strong> {it.impact}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
                  <span className="font-heading font-semibold text-ink">{it.owner}</span>
                  <span>·</span>
                  <span>{it.due}</span>
                  {internalView && (
                    <ActionToggle
                      clientSlug={clientSlug}
                      monthKey={month}
                      actionId={it.id}
                      done={it.status === "done"}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
