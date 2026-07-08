import Image from "next/image";
import Link from "next/link";
import { fmtUpdated } from "@/lib/format";
import type { PortalShell } from "@/lib/portal/types";
import { Wordmark } from "./wordmark";
import { ClientSwitcher, MonthSwitcher } from "./switchers";
import {
  BackToInternalButton,
  ExportPdfButton,
  ViewAsClientButton,
} from "./top-bar-actions";
import { AddReport, FIXTURE_SAMPLES } from "@/components/ingest/add-report";
import { fixturesEnabled } from "@/lib/portal/fixtures-flag";
import { BTN_SECONDARY, InternalBadge, SignOutButton } from "@/components/ui";

export function TopBar({ shell }: { shell: PortalShell }) {
  const { client, month, months, clients } = shell;
  const internalView = shell.effectiveRole === "internal";

  return (
    <div className="np sticky top-0 z-50 flex h-[62px] items-center gap-[14px] border-b border-line bg-white px-5 max-[960px]:h-auto max-[960px]:flex-wrap max-[960px]:gap-2 max-[960px]:px-3.5 max-[960px]:py-2.5">
      <Wordmark />
      {internalView && <InternalBadge />}
      <div className="h-[26px] w-px bg-line" />
      {internalView ? (
        <ClientSwitcher clients={clients} activeSlug={client.slug} />
      ) : (
        <div className="flex items-center gap-[9px]">
          {client.logo_url ? (
            <Image
              src={client.logo_url}
              alt={client.name}
              width={96}
              height={30}
              className="block h-[30px] w-auto"
              unoptimized
            />
          ) : (
            <>
              <div
                className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] font-heading text-xs font-semibold text-white"
                style={{ background: client.accent_colour ?? "#4A6B62" }}
              >
                {client.initials}
              </div>
              <span className="font-heading text-[14.5px] font-semibold">
                {client.name}
              </span>
            </>
          )}
        </div>
      )}
      <MonthSwitcher
        months={months}
        activeKey={month.key}
        clientSlug={client.slug}
        showStatus={internalView}
      />
      {month.updated_at && (
        <span className="whitespace-nowrap text-xs text-muted">
          Updated {fmtUpdated(month.updated_at)}
        </span>
      )}
      <div className="flex-1" />
      {internalView && (
        <AddReport
          clientId={client.id}
          clientSlug={client.slug}
          samples={fixturesEnabled() ? FIXTURE_SAMPLES : null}
        />
      )}
      <ExportPdfButton />
      {internalView && (
        <>
          <Link href="/admin" className={BTN_SECONDARY}>
            Admin
          </Link>
          <ViewAsClientButton
            clientSlug={client.slug}
            clientName={client.name}
            monthKey={month.key}
          />
        </>
      )}
      {shell.viewAsClient && (
        <BackToInternalButton clientSlug={client.slug} monthKey={month.key} />
      )}
      {!shell.viewAsClient && <SignOutButton />}
    </div>
  );
}
