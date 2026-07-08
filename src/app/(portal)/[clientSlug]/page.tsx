import { redirect } from "next/navigation";
import { getDefaultRoute } from "@/lib/portal";

export default async function ClientIndex({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  redirect(await getDefaultRoute(clientSlug));
}
