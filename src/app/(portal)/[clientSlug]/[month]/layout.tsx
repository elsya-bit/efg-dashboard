import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalShell } from "@/lib/portal";
import { exitClientView } from "@/lib/portal/view-as-action";
import { BTN_BACK_INTERNAL, BTN_SECONDARY, SignOutButton } from "@/components/ui";
import { ToastProvider } from "@/components/toast";
import { TopBar } from "@/components/shell/top-bar";
import { DraftBanner } from "@/components/shell/draft-banner";
import { Sidebar } from "@/components/shell/sidebar";
import { MobileNav } from "@/components/shell/mobile-nav";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getPortalShell(clientSlug, month);

  if (result.kind === "redirect") {
    redirect(result.to);
  }
  if (result.kind === "no-reports") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page p-6">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-line bg-white p-6 text-center">
          <div className="font-heading text-[17px] font-semibold text-ink">
            No report to show yet
          </div>
          <p className="text-[13.5px] leading-relaxed text-muted">{result.reason}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {result.viewAsClient && (
              // Escape hatch: without it the persisted view-as cookie would
              // trap internal users on this screen.
              <form action={exitClientView}>
                <button type="submit" className={BTN_BACK_INTERNAL}>
                  Back to internal view
                </button>
              </form>
            )}
            {result.realRole === "internal" && !result.viewAsClient && (
              <Link href="/" className={BTN_SECONDARY}>
                Back to the portal
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  const { shell } = result;
  const showDraftBanner =
    shell.effectiveRole === "internal" && shell.month.status !== "Published";

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <TopBar shell={shell} />
        {showDraftBanner && <DraftBanner month={shell.month} />}
        <div className="flex flex-1 items-stretch">
          <Sidebar
            clientSlug={shell.client.slug}
            monthKey={shell.month.key}
            managerName={shell.client.manager}
          />
          <div className="mx-auto box-border flex w-full max-w-[1220px] flex-1 flex-col gap-[18px] px-[30px] pb-[60px] pt-[26px] print:p-0 min-w-0">
            <MobileNav clientSlug={shell.client.slug} monthKey={shell.month.key} />
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
