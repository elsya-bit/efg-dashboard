import { monthName } from "@/lib/format";
import { PlaceholderScreen } from "@/components/shell/placeholder-screen";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { month } = await params;
  return (
    <PlaceholderScreen
      title="Campaigns"
      subtitle={`Every campaign that ran in ${monthName(month)}. Click a row for quality notes and what we are doing about it.`}
      phase={5}
    />
  );
}
