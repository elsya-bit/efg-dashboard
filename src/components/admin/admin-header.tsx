import Link from "next/link";
import { AddClientButton } from "./add-client-button";

/** Admin workspace header: title, tab chips, Add client, Back to dashboard. */
export function AdminHeader({
  active,
  clientSlug,
}: {
  active: "pipeline" | "desk" | "settings";
  /** Client context for the desk/settings tab links. */
  clientSlug: string;
}) {
  const tab = (on: boolean) =>
    `rounded-[10px] border px-3.5 py-2 font-heading text-[12.5px] font-semibold ${
      on ? "border-primary bg-primary text-white" : "border-line bg-white text-primary"
    }`;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="mr-2.5 flex flex-col gap-[3px]">
        <div className="font-heading text-xl font-semibold">Admin workspace</div>
        <div className="text-[13.5px] text-muted">
          Generate once, review, publish. Clients only ever read the published
          report.
        </div>
      </div>
      <div className="flex-1" />
      <Link href="/admin/pipeline" className={tab(active === "pipeline")}>
        Pipeline
      </Link>
      <Link href={`/admin/desk/${clientSlug}`} className={tab(active === "desk")}>
        Review desk
      </Link>
      <Link
        href={`/admin/settings/${clientSlug}`}
        className={tab(active === "settings")}
      >
        Client settings
      </Link>
      <AddClientButton />
      <Link
        href="/"
        className="rounded-[10px] border border-line bg-white px-3.5 py-2 font-heading text-[12.5px] font-semibold text-primary"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
