import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

export default function CreativePage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Creative"
        subtitle="Which ads are working hardest and which need a refresh."
      />
      <PlaceholderCard phase={5} />
    </div>
  );
}
