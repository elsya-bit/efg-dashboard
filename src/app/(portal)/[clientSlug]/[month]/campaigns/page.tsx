import { monthName } from "@/lib/format";
import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { month } = await params;
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Campaigns"
        subtitle={`Every campaign that ran in ${monthName(month)}. Click a row for quality notes and what we are doing about it.`}
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
