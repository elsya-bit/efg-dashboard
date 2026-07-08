import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal";
import { SignOutButton } from "@/components/ui";

export default async function NoAccessPage() {
  const session = await getPortalSession();

  if (!session) {
    redirect("/login");
  }

  if (session.realRole === "internal" || session.clientCount > 0) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex-1 bg-page flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white border border-line rounded-2xl p-6 flex flex-col gap-3 items-start">
        <h1 className="font-heading text-[17px] font-semibold text-ink">
          No client linked to this login yet
        </h1>
        <p className="font-body text-[13.5px] text-muted leading-relaxed">
          Your EFG contact needs to connect your account to your dashboard.
          Email contact@efgconsulting.com.au and we will sort it out.
        </p>
        <SignOutButton />
      </div>
    </main>
  );
}
