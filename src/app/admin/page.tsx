import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/portal";
import { Wordmark } from "@/components/shell/wordmark";
import { Chip } from "@/components/chips";

export default async function AdminPage() {
  const role = await getSessionRole();
  if (!role) redirect("/login");
  if (role !== "internal") redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="np flex h-[62px] items-center gap-3.5 border-b border-line bg-white px-5">
        <Wordmark />
        <span className="rounded-full border border-line bg-soft px-2.5 py-[3px] font-heading text-[11px] font-semibold tracking-[.04em] text-primary">
          Internal
        </span>
        <div className="flex-1" />
        <Link
          href="/"
          className="rounded-[10px] border border-line bg-white px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary"
        >
          Back to portal
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col gap-[18px] px-[30px] pb-[60px] pt-[26px]">
        <div className="flex flex-col gap-[3px]">
          <div className="font-heading text-xl font-semibold">Admin workspace</div>
          <div className="text-[13.5px] text-muted">
            Pipeline, review desk and client settings for the EFG team.
          </div>
        </div>
        <div className="flex gap-2">
          <Chip className="border-line bg-white text-muted">Pipeline</Chip>
          <Chip className="border-line bg-white text-muted">Review desk</Chip>
          <Chip className="border-line bg-white text-muted">Client settings</Chip>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(22,46,39,.05)]">
          <div className="font-heading text-[15.5px] font-semibold text-ink">
            The admin workspace is built in Phase 6
          </div>
          <div className="max-w-md text-[13.5px] leading-relaxed text-muted">
            Publish workflow, upload management and client settings land here.
            Until then, months are published directly in the database.
          </div>
        </div>
      </div>
    </div>
  );
}
