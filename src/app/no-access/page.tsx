import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth";

export default async function NoAccessPage() {
  const ctx = await getUserContext();

  if (!ctx) {
    redirect("/login");
  }

  if (ctx.isInternal || ctx.clients.length > 0) {
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
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="font-heading font-semibold text-[12.5px] px-3.5 py-2 rounded-[10px] border border-line bg-white text-primary"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
