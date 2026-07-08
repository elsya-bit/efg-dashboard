import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default function AbTestingPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="A/B Testing"
        subtitle="What we are testing, what is winning, and what happens next."
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
