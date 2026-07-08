import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default function DailyTrackerPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Daily Tracker"
        subtitle="What each state campaign spent, day by day."
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
