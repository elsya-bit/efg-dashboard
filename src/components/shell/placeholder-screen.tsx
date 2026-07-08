/** Shared screen header: 20px Poppins title + 13.5px muted subtitle. */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="font-heading text-xl font-semibold">{title}</div>
      {subtitle && <div className="text-[13.5px] text-muted">{subtitle}</div>}
    </div>
  );
}

/** Temporary stand-in card for content delivered in a later phase. */
export function PlaceholderCard({
  phase,
  title = "This screen is on its way",
  body,
}: {
  phase: number;
  title?: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="font-heading text-[15.5px] font-semibold text-ink">
        {title}
      </div>
      <div className="max-w-md text-[13.5px] leading-relaxed text-muted">
        {body ??
          `It arrives in Phase ${phase} of the build plan. The navigation, data and publishing rules around it are already live.`}
      </div>
    </div>
  );
}

/**
 * Whole placeholder screen. Returns a fragment — the portal layout already
 * provides the flex column with the 18px section gap.
 */
export function PlaceholderScreen({
  title,
  subtitle,
  phase,
}: {
  title: string;
  subtitle: string;
  phase: number;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <PlaceholderCard phase={phase} />
    </>
  );
}
