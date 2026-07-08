import { redirect } from "next/navigation";

export default async function MonthIndex({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  redirect(`/${clientSlug}/${month}/overview`);
}
