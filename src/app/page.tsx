import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth";

export default async function HomePage() {
  const ctx = await getUserContext();

  if (!ctx) {
    redirect("/login");
  }

  if (!ctx.isInternal && ctx.clients.length === 0) {
    redirect("/no-access");
  }

  return (
    <>
      <header className="np h-[62px] bg-white border-b border-line px-5 flex items-center gap-3.5">
        <p className="font-heading text-[18px] leading-none">
          <span className="font-semibold text-ink">EFG</span>
          <span className="font-semibold text-accent">.</span>
          <span className="text-[15px] font-medium text-muted"> Consulting</span>
        </p>
        {ctx.isInternal ? (
          <span className="font-heading font-semibold text-[11px] tracking-[.04em] px-2.5 py-[3px] rounded-full bg-soft text-primary border border-line">
            Internal
          </span>
        ) : null}
        <div className="flex-1" />
        <span className="font-body text-xs text-muted">{ctx.user.email}</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="font-heading font-semibold text-[12.5px] px-3.5 py-2 rounded-[10px] border border-line bg-white text-primary"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="max-w-3xl mx-auto w-full p-8 flex flex-col gap-4">
        <section className="bg-white border border-line rounded-2xl p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)] flex flex-col gap-4">
          <h1 className="font-heading text-[15.5px] font-semibold text-ink">
            Phase 1 · Auth + data layer scaffold
          </h1>

          <div className="flex flex-col gap-1.5 font-body text-[13.5px] text-ink">
            <p>
              <span className="text-muted">Signed in as </span>
              {ctx.user.email}
            </p>
            <p>
              <span className="text-muted">Role </span>
              {ctx.isInternal ? "Internal (EFG staff)" : "Client"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-heading font-semibold text-[10.5px] uppercase tracking-[.07em] text-muted">
              Clients this login can read
            </p>
            {ctx.clients.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {ctx.clients.map((client) => (
                  <span
                    key={client.id}
                    className="inline-flex items-center gap-2 border border-line rounded-full px-3 py-1.5 text-[12.5px] font-heading font-semibold text-ink"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: client.accent_colour ?? "#4A6B62",
                      }}
                    />
                    {client.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-body text-[12.5px] text-muted">
                No clients visible to this login yet.
              </p>
            )}
          </div>

          <p className="font-body text-xs text-muted">
            What you see here is exactly what row-level security lets this
            login read.
          </p>
        </section>
      </main>
    </>
  );
}
