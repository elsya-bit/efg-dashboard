"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[360px] max-w-[90vw] rounded-2xl bg-white p-6 shadow-[0_24px_64px_rgba(22,46,39,.35)] flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[15.5px] font-semibold text-ink">
          Sign in to your report
        </h1>
        <p className="font-body text-[13px] text-muted">
          Sign in with the details your EFG contact gave you.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-body text-xs text-muted">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full font-body text-sm text-ink border border-line rounded-[10px] px-3 py-2.5 focus:outline-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-body text-xs text-muted">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full font-body text-sm text-ink border border-line rounded-[10px] px-3 py-2.5 focus:outline-primary"
        />
      </label>

      {error ? (
        <p className="font-body text-[13px] text-danger">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold text-[13.5px] bg-primary text-white rounded-[10px] py-2.5 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
