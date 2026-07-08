import { redirect } from "next/navigation";

/** Uploads now live inside Client settings (prototype layout). */
export default async function UploadsRedirect({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  redirect(`/admin/settings/${clientSlug}`);
}
