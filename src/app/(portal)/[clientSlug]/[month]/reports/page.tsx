import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Reports"
        subtitle="Every month EFG has reported for you. Nothing updates behind your back."
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
