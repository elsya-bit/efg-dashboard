import { redirect } from "next/navigation";
import { getDefaultRoute } from "@/lib/portal";

export default async function Home() {
  redirect(await getDefaultRoute());
}
