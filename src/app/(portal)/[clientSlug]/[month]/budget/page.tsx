import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Budget"
        subtitle="How spending is tracking against the plan."
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
