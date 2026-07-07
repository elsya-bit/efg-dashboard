import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex-1 bg-ink flex flex-col items-center justify-center gap-[18px] px-6 py-10">
      <p className="font-heading text-[26px] leading-none">
        <span className="font-semibold text-white">EFG</span>
        <span className="font-semibold text-[#D0E8E2]">.</span>
        <span className="font-medium text-[#D0E8E2]"> Consulting</span>
      </p>
      <LoginForm />
      <p className="font-body text-[11.5px] text-[#D0E8E2]/60">
        The team behind your team
      </p>
    </main>
  );
}
