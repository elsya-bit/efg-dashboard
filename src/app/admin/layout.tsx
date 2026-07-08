import Link from "next/link";
import { Wordmark } from "@/components/shell/wordmark";
import { ToastProvider } from "@/components/toast";
import { BTN_SECONDARY, InternalBadge, SignOutButton } from "@/components/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <div className="np flex h-[62px] items-center gap-3.5 border-b border-line bg-white px-5 max-[960px]:h-auto max-[960px]:flex-wrap max-[960px]:gap-2 max-[960px]:px-3.5 max-[960px]:py-2.5">
          <Wordmark />
          <InternalBadge />
          <div className="flex-1" />
          <Link href="/" className={BTN_SECONDARY}>
            Back to portal
          </Link>
          <SignOutButton />
        </div>
        <div className="mx-auto box-border flex w-full max-w-[1220px] flex-1 flex-col gap-[18px] px-[30px] pb-[60px] pt-[26px] max-[960px]:px-3.5">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
