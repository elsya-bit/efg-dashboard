import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default function ActionsPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Actions"
        subtitle="What we are doing, why, and who owns it."
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
